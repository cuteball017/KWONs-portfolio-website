"use client"

import { AnimatePresence, motion } from "framer-motion"
import { Languages } from "lucide-react"
import { copy, type Lang } from "@/lib/copy"
import { useLanguage } from "@/lib/i18n"
import { EASE } from "@/lib/motion"
import { cn } from "@/lib/utils"

const LANGS: Lang[] = ["en", "ja"]

/**
 * Flips the page between English and Japanese. The button names the language on screen; the new
 * name rises into place while the old one drifts away.
 */
export function LanguageToggle({ className }: { className?: string }) {
  const { lang, toggle } = useLanguage()
  const { label, switchTo } = copy[lang].language

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`${label} – ${switchTo}`}
      title={switchTo}
      className={cn(
        "flex h-10 items-center gap-1.5 rounded-full px-3 text-[0.9rem] text-slate-300 transition-colors duration-500 focus:outline-none focus-visible:bg-white/10 active:bg-white/10 [@media(hover:hover)]:hover:bg-white/10 [@media(hover:hover)]:hover:text-white",
        className,
      )}
    >
      <Languages aria-hidden="true" size={17} className="shrink-0" />
      {/* Every label sits in the same grid cell, so the button keeps one width in both languages */}
      <span className="grid">
        {LANGS.map((code) => (
          <span key={code} aria-hidden="true" className="invisible col-start-1 row-start-1">
            {copy[code].language.label}
          </span>
        ))}
        <AnimatePresence initial={false}>
          <motion.span
            key={lang}
            lang={lang}
            initial={{ opacity: 0, y: 7, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -7, filter: "blur(4px)" }}
            transition={{ duration: 0.45, ease: EASE }}
            className="col-start-1 row-start-1 text-center"
          >
            {label}
          </motion.span>
        </AnimatePresence>
      </span>
    </button>
  )
}
