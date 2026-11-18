"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Send, Wrench } from "lucide-react"
import { motion } from "framer-motion"
import { useMediaQuery } from "@/hooks/use-media-query"
import { CHAT_MAINTENANCE } from "@/lib/chat-status"
import { useCopy } from "@/lib/i18n"
import { EASE } from "@/lib/motion"

interface Message {
  text: string
  isUser: boolean
}

const bubble = {
  user: "rounded-br-md bg-gradient-to-b from-blue-400/80 to-blue-600/70 text-white shadow-[inset_0_1px_0.5px_rgba(255,255,255,0.45),inset_0_-1px_0.5px_rgba(255,255,255,0.12),0_10px_28px_-14px_rgba(59,130,246,0.9)]",
  bot: "rounded-bl-md bg-gradient-to-b from-white/[0.09] to-white/[0.04] text-slate-200 shadow-[inset_0_1px_0.5px_rgba(255,255,255,0.18),inset_0_0_0_1px_rgba(255,255,255,0.05)]",
}

const ChatBot = () => {
  const t = useCopy()
  // The conversation so far. The greeting is not stored here, so it follows the language button.
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  // Number of questions still waiting for an answer — drives the "thinking" indicator
  const [pending, setPending] = useState(0)
  const messageListRef = useRef<HTMLDivElement>(null)
  const isMobile = useMediaQuery("(max-width: 768px)")

  // Keep the newest message in view. Scrolls the chat panel only, never the page.
  useEffect(() => {
    const list = messageListRef.current
    if (list) list.scrollTo({ top: list.scrollHeight, behavior: "smooth" })
  }, [messages, pending])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (CHAT_MAINTENANCE || !input.trim()) return

    const userMessage = { text: input, isUser: true }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setPending((count) => count + 1)

    try {
      // Our own API route (app/api/ask/route.ts) asks Claude; the API key stays on the server.
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: input }),
      })

      // The route returns { answer } on success and { error } otherwise.
      const data = await res.json().catch(() => null)
      if (!res.ok || typeof data?.answer !== "string") throw new Error(data?.error ?? `HTTP ${res.status}`)
      setMessages((prev) => [...prev, { text: data.answer, isUser: false }])
    } catch (error) {
      setMessages((prev) => [...prev, { text: t.qa.error, isUser: false }])
    } finally {
      setPending((count) => count - 1)
    }
  }

  return (
    <div className="mx-auto w-full">
      {/* The conversation sits in a recess pressed into the glass panel around it */}
      <div
        className="glass-well flex flex-col overflow-hidden rounded-2xl"
        style={{ height: isMobile ? "400px" : "500px" }}
      >
        {CHAT_MAINTENANCE ? (
          // Closed for now: the window stays, with a quiet notice where the conversation would be.
          <div role="status" className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-300/[0.08] text-blue-200 shadow-[inset_0_1px_0.5px_rgba(255,255,255,0.16),inset_0_0_0_1px_rgba(147,197,253,0.12),0_0_44px_-10px_rgba(59,130,246,0.7)]">
              <Wrench aria-hidden="true" size={22} />
            </span>
            <p className="mt-5 flex items-center gap-2.5 font-display text-lg font-medium text-white">
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full bg-blue-300 shadow-[0_0_8px_2px_rgba(147,197,253,0.7)] motion-safe:animate-twinkle"
              />
              {t.qa.maintenance.title}
            </p>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-400">{t.qa.maintenance.body}</p>
          </div>
        ) : (
          /* Chat messages */
          <div ref={messageListRef} className="flex-1 space-y-4 overflow-y-auto p-4">
            <div className="flex justify-start">
              <div className={`max-w-[85%] break-words rounded-2xl px-4 py-2.5 leading-relaxed ${bubble.bot}`}>
                {t.qa.greeting}
              </div>
            </div>

            {messages.map((message, index) => (
              <motion.div
                key={index}
                className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}
                initial={{ opacity: 0, y: 12, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.55, ease: EASE }}
                style={{ transformOrigin: message.isUser ? "100% 100%" : "0% 100%" }}
              >
                <div
                  className={`max-w-[85%] break-words rounded-2xl px-4 py-2.5 leading-relaxed ${
                    message.isUser ? bubble.user : bubble.bot
                  }`}
                >
                  {message.text}
                </div>
              </motion.div>
            ))}

            {/* Thinking indicator: three small stars taking turns to shine */}
            {pending > 0 && (
              <motion.div
                className="flex justify-start"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: EASE }}
                role="status"
                aria-label={t.qa.thinking}
              >
                <div className={`flex items-center gap-1.5 rounded-2xl px-4 py-3.5 ${bubble.bot}`}>
                  {[0, 1, 2].map((dot) => (
                    <span
                      key={dot}
                      className="h-1.5 w-1.5 animate-twinkle rounded-full bg-blue-200 shadow-[0_0_8px_1px_rgba(147,197,253,0.7)]"
                      style={{ animationDuration: "1.4s", animationDelay: `${dot * 0.22}s` }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* Chat input */}
        <form onSubmit={handleSend} className="border-t border-white/[0.06] bg-white/[0.025] p-3">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={CHAT_MAINTENANCE ? t.qa.maintenance.placeholder : t.qa.placeholder}
              aria-label={t.qa.placeholder}
              disabled={CHAT_MAINTENANCE}
              maxLength={500}
              className="min-w-0 flex-1 rounded-full bg-white/[0.05] px-4 py-2.5 text-base text-white shadow-[inset_0_1px_3px_rgba(0,0,0,0.45),inset_0_0_0_1px_rgba(255,255,255,0.09)] outline-none transition-all duration-500 ease-soft placeholder:text-slate-500 focus:bg-white/[0.07] focus:shadow-[inset_0_1px_3px_rgba(0,0,0,0.45),inset_0_0_0_1px_rgba(147,197,253,0.5),0_0_0_4px_rgba(59,130,246,0.14)] disabled:cursor-not-allowed disabled:bg-white/[0.025] disabled:placeholder:text-slate-500/70 sm:text-sm"
            />
            <button
              type="submit"
              disabled={CHAT_MAINTENANCE}
              className="glass-control glass-control--tint h-10 w-10 shrink-0"
              aria-label={t.qa.send}
            >
              <Send size={16} />
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ChatBot
