/**
 * Every piece of text on the page, in English and Japanese. The language button in the navigation
 * bar switches between the two. Japanese must have the same shape as English (TypeScript checks it).
 *
 * What the AI chatbot knows about KWON WOOSUB lives separately, in lib/profile.ts.
 */

export type Lang = "en" | "ja"

const en = {
  /** The language button shows the language currently on screen. */
  language: {
    label: "English",
    switchTo: "Switch to Japanese",
  },
  nav: {
    home: "Home",
    about: "About",
    work: "Work",
    qa: "Q&A with AI",
    openMenu: "Open menu",
    closeMenu: "Close menu",
  },
  loading: "Loading...",
  hero: {
    greeting: "Hello! It's",
    about: "About Me",
    qa: "Q&A with AI",
  },
  about: {
    heading: "About Me",
    title: "Machine Learning Engineer",
    profile: {
      education: {
        label: "Education",
        items: [
          {
            title: "Ritsumeikan University",
            // The non-breaking space keeps "(currently enrolled)" together when the line wraps.
            detail: "College of Information Science and Engineering (currently enrolled)",
          },
        ],
      },
      experience: {
        label: "Experience",
        items: [{ title: "Tleez", detail: "Apr 2025 – Present" }],
      },
      awards: {
        label: "Awards",
        items: [
          { title: "Grand Prize (Team okaery)", detail: "21st Student Venture Contest 2024 Powered by RIMIX" },
          { title: "Osaka Shinkin Bank Award (Team okaery)", detail: "KANSAI STUDENTS PITCH Grand Prix 2025" },
        ],
      },
      certifications: {
        label: "Certifications",
        items: [{ title: "JLPT N1", detail: "Japanese-Language Proficiency Test, highest level" }],
      },
    },
    skillsHeading: "Code Arsenal",
    skillGroups: {
      languages: "Programming Languages",
      // The zero-width space lets narrow cards wrap after the slash instead of overflowing.
      frameworks: "Frameworks/​Libraries",
      tools: "Tools",
    },
  },
  work: {
    heading: "What I've Built",
    code: "Code",
    viewService: "View Service",
    projects: {
      atta: {
        title: "Atta",
        description:
          "Lost-and-found management app for facilities. Snap a photo and AI fills in the item details, find items by chatting with AI, and handle returns with digital signatures and automatically filled PDF reports.",
        tags: ["Next.js", "Supabase", "Gemini AI", "PWA"],
      },
      copiru: {
        title: "Copiru (In charge of Korean)",
        description:
          "AI proofreading app for Mac and Windows. Catches typos and inconsistent wording in 10 languages, offline and right inside the apps you already write in.",
        tags: ["AI Proofreading", "Offline", "Multilingual", "Mac / Windows"],
      },
      blog: {
        title: "KWON's Portfolio Web Blog",
        description:
          "This website. A starfield drawn on canvas, a liquid glass UI, an English/Japanese toggle and an AI chat that answers questions about me.",
        tags: ["Next.js", "TypeScript", "Tailwind CSS", "Framer Motion", "Claude API"],
      },
    },
  },
  qa: {
    heading: "Q&A with AI",
    intro: "Ask me anything about KWON WOOSUB's skills, experience, or interests!",
    greeting: "Hi there! I'm KWON WOOSUB's AI assistant. What would you like to know about me?",
    placeholder: "Ask me anything...",
    send: "Send message",
    thinking: "Thinking",
    error: "Sorry, something went wrong. Please try again.",
    maintenance: {
      title: "Under maintenance",
      body: "The AI chat is taking a short break while it's being improved. Please check back soon.",
      placeholder: "Chat is under maintenance",
    },
  },
}

export type Copy = typeof en

const ja: Copy = {
  language: {
    label: "日本語",
    switchTo: "英語に切り替える",
  },
  nav: {
    home: "ホーム",
    about: "プロフィール",
    work: "制作実績",
    qa: "AIに質問",
    openMenu: "メニューを開く",
    closeMenu: "メニューを閉じる",
  },
  loading: "読み込み中…",
  hero: {
    greeting: "こんにちは！",
    about: "プロフィール",
    qa: "AIに質問する",
  },
  about: {
    heading: "プロフィール",
    title: "機械学習エンジニア",
    profile: {
      education: {
        label: "学歴",
        items: [{ title: "立命館大学", detail: "情報理工学部 情報理工学科（在学中）" }],
      },
      experience: {
        label: "職歴",
        items: [{ title: "株式会社Tleez", detail: "2025年4月 – 現在" }],
      },
      awards: {
        label: "受賞歴",
        items: [
          { title: "最優秀賞（チームokaery）", detail: "第21回学生ベンチャーコンテスト2024 Powered by RIMIX" },
          { title: "大阪信用金庫賞（チームokaery）", detail: "KANSAI STUDENTS PITCH Grand Prix 2025" },
        ],
      },
      certifications: {
        label: "資格",
        items: [{ title: "日本語能力試験 N1", detail: "合格" }],
      },
    },
    skillsHeading: "スキル",
    skillGroups: {
      languages: "プログラミング言語",
      frameworks: "フレームワーク・ライブラリ",
      tools: "ツール",
    },
  },
  work: {
    heading: "制作実績",
    code: "コード",
    viewService: "サービスを見る",
    projects: {
      atta: {
        title: "Atta",
        description:
          "施設向けの落とし物管理アプリ。写真を撮るとAIが物品の情報を入力し、AIとのチャットで落とし物を探せます。返却は電子サインで受け付け、提出書類のPDFも自動で作成します。",
        tags: ["Next.js", "Supabase", "Gemini AI", "PWA"],
      },
      copiru: {
        title: "Copiru（韓国語担当）",
        description:
          "Mac・Windows対応のAI文章校正アプリ。10言語の誤字脱字や表記ゆれを、オフラインのまま、普段使っているアプリの中でチェックします。",
        tags: ["AI校正", "オフライン", "多言語対応", "Mac / Windows"],
      },
      blog: {
        title: "KWON's Portfolio Web Blog",
        description:
          // U+2060 (word joiner) keeps 星空, 切り替え and 私について from being split across lines.
          "このサイトです。Canvasで描いた星⁠空、リキッドグラス風のUI、英語・日本語の切り⁠替え、私に⁠ついて答えるAIチャットを備えています。",
        tags: ["Next.js", "TypeScript", "Tailwind CSS", "Framer Motion", "Claude API"],
      },
    },
  },
  qa: {
    heading: "AIに質問",
    intro: "KWON WOOSUBのスキルや経歴、興味のあることについて、何でも聞いてください！",
    greeting: "こんにちは！KWON WOOSUBのAIアシスタントです。知りたいことを何でも聞いてください。",
    placeholder: "質問を入力…",
    send: "メッセージを送信",
    thinking: "考え中",
    error: "エラーが発生しました。もう一度お試しください。",
    maintenance: {
      title: "メンテナンス中",
      body: "AIチャットは現在、改善のためメンテナンス中です。もうしばらくお待ちください。",
      placeholder: "メンテナンス中のため入力できません",
    },
  },
}

export const copy: Record<Lang, Copy> = { en, ja }
