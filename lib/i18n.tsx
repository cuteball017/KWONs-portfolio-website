"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { copy, type Copy, type Lang } from "@/lib/copy"

const STORAGE_KEY = "lang"

const LanguageContext = createContext<{ lang: Lang; toggle: () => void }>({ lang: "en", toggle: () => {} })

/**
 * English on a first visit; the language button flips between English and Japanese.
 * The choice is remembered in this browser, so a reload keeps it.
 */
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>("en")

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) === "ja") setLang("ja")
    } catch {
      // Storage can be blocked (private mode, strict settings); English is fine then.
    }
  }, [])

  // Screen readers, fonts and line breaking all follow <html lang>.
  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  const toggle = () => {
    const next: Lang = lang === "en" ? "ja" : "en"
    setLang(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {}
  }

  return <LanguageContext.Provider value={{ lang, toggle }}>{children}</LanguageContext.Provider>
}

export const useLanguage = () => useContext(LanguageContext)

/** The page text in the language on screen. */
export function useCopy(): Copy {
  return copy[useLanguage().lang]
}
