import Anthropic from "@anthropic-ai/sdk"
import { NextResponse } from "next/server"
import { CHAT_MAINTENANCE } from "@/lib/chat-status"
import { SYSTEM_PROMPT } from "@/lib/profile"

/**
 * POST /api/ask  { question: string }  ->  { answer: string }  or  { error: string }
 *
 * Runs on the server only, so ANTHROPIC_API_KEY (from .env.local, or the hosting provider's
 * environment variables) never reaches the browser.
 */
export const runtime = "nodejs"

const MODEL = "claude-opus-5-5"
/** Longest question accepted, in characters. */
const MAX_QUESTION_LENGTH = 500
/** Questions one visitor (IP address) may ask per minute. */
const RATE_LIMIT = 10
const RATE_WINDOW_MS = 60_000

const REFUSAL_ANSWER =
  "Sorry, I can't help with that one. Feel free to ask about KWON WOOSUB's skills, projects or experience!"

let client: Anthropic | null = null

// Best-effort guard against someone looping this endpoint and burning API credits. It lives in this
// server instance's memory, so on serverless hosting every instance counts on its own; the spend
// limit in the Claude Console is the real cap.
const recentRequests = new Map<string, number[]>()

function allowRequest(ip: string) {
  const now = Date.now()
  const recent = (recentRequests.get(ip) ?? []).filter((time) => now - time < RATE_WINDOW_MS)
  const allowed = recent.length < RATE_LIMIT
  if (allowed) recent.push(now)
  recentRequests.set(ip, recent)

  if (recentRequests.size > 5000) {
    for (const [key, times] of recentRequests) {
      if (now - times[times.length - 1] >= RATE_WINDOW_MS) recentRequests.delete(key)
    }
  }
  return allowed
}

const fail = (status: number, error: string) => NextResponse.json({ error }, { status })

export async function POST(request: Request) {
  // Under maintenance: answer before anything else, so no request reaches the Claude API.
  if (CHAT_MAINTENANCE) return fail(503, "The chatbot is under maintenance.")

  const ip =request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local"
  if (!allowRequest(ip)) return fail(429, "Too many questions. Please wait a minute and try again.")

  const body = await request.json().catch(() => null)
  const question = typeof body?.question === "string" ? body.question.trim() : ""
  if (!question) return fail(400, "Please send a question.")
  if (question.length > MAX_QUESTION_LENGTH) {
    return fail(400, `Please keep questions under ${MAX_QUESTION_LENGTH} characters.`)
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    console.error("[api/ask] ANTHROPIC_API_KEY is not set. Add it to .env.local and restart the server.")
    return fail(503, "The chatbot is not configured yet.")
  }
  client ??= new Anthropic({ apiKey })

  try {
    const response = await client.beta.messages.create({
      model: MODEL,
      max_tokens: 4096,
      // Thinking is always on with this model; effort sets how deep it goes. Short answers about a
      // profile need little.
      output_config: { effort: "low" },
      // If the model declines a question on safety grounds, the API answers it with a fallback
      // model inside the same call.
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      // The profile is the same on every request, so it is cached: questions that arrive within
      // 5 minutes of each other read it at a fraction of the normal input price.
      system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
      messages: [{ role: "user", content: question }],
    })

    if (response.stop_reason === "refusal") return NextResponse.json({ answer: REFUSAL_ANSWER })

    const answer = response.content
      .flatMap((block) => (block.type === "text" ? [block.text] : []))
      .join("")
      .trim()
    if (!answer) {
      console.error(`[api/ask] Empty answer (stop_reason: ${response.stop_reason}).`)
      return fail(502, "No answer came back. Please try again.")
    }
    return NextResponse.json({ answer })
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) {
      console.error("[api/ask] The API key was rejected. Check ANTHROPIC_API_KEY in .env.local.")
      return fail(503, "The chatbot is not configured correctly.")
    }
    if (error instanceof Anthropic.RateLimitError) {
      return fail(429, "The chatbot is busy right now. Please try again shortly.")
    }
    if (error instanceof Anthropic.APIError) {
      // 402 means a billing problem, e.g. no API credits left.
      console.error(`[api/ask] Claude API error ${error.status}: ${error.message}`)
      return fail(502, "Something went wrong. Please try again.")
    }
    console.error("[api/ask] Unexpected error:", error)
    return fail(500, "Something went wrong. Please try again.")
  }
}
