# KWON WOOSUB — Portfolio

My personal portfolio website: a profile, the projects I've built, and an AI chat that answers questions about me.

## Features

- **Deep-space hero** — an animated starfield drawn on canvas, with stardust that follows the cursor
- **Liquid-glass UI** — frosted navigation bar, buttons and cards
- **Profile** — education, experience, awards and certifications
- **Projects** — cards with links to each live service and its code
- **English / Japanese** — one button in the navigation bar switches the whole page
- **Q&A with AI** — a chatbot that answers questions about me *(currently under maintenance)*

## Tech stack

- [Next.js 15](https://nextjs.org/) (App Router) · React 19 · TypeScript
- Tailwind CSS · Framer Motion
- Anthropic SDK for the AI chat (server-side API route)

## Getting started

```bash
npm install --legacy-peer-deps
npm run dev
```

Then open <http://localhost:3000>.

`--legacy-peer-deps` is needed because of a peer-dependency conflict between `react-day-picker` and `date-fns`.

### Environment variables

The AI chat needs an API key. Create `.env.local` in the project root:

```
ANTHROPIC_API_KEY=your-api-key
```

The key is only read on the server (`app/api/ask/route.ts`) and never reaches the browser. `.env.local` is git-ignored. When deploying, add the same variable in your hosting provider's settings.

## Project structure

```
app/
  page.tsx              Page sections (hero, about, work, Q&A, footer)
  api/ask/route.ts      AI chat endpoint
components/             UI components (navbar, profile, project cards, chat, ...)
hooks/                  Shared React hooks
lib/
  copy.ts               All page text, in English and Japanese
  profile.ts            What the AI chat knows about me
  chat-status.ts        Maintenance switch for the AI chat
  cosmos.ts             Starfield and stardust animation
```

## Editing content

| What | Where |
| --- | --- |
| Any text on the page (both languages) | `lib/copy.ts` |
| Project links | `projects` in `app/page.tsx` |
| What the AI chat can answer | `lib/profile.ts` |
| Turn the AI chat back on | set `CHAT_MAINTENANCE` to `false` in `lib/chat-status.ts` |

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Build for production |
| `npm run start` | Run the production build |
