"use client"

import { motion } from "framer-motion"
import { focusIn, inView } from "@/lib/motion"
import { cn } from "@/lib/utils"

interface SectionHeadingProps {
  title: string
  emoji?: string
  as?: "h2" | "h3"
  className?: string
}

/** Section title in starlight gradient, with a small trail of light underneath. */
export function SectionHeading({ title, emoji, as: Tag = "h2", className }: SectionHeadingProps) {
  return (
    <motion.div
      variants={focusIn}
      initial="hidden"
      whileInView="show"
      viewport={inView}
      className={cn("mb-10 text-center md:mb-14", className)}
    >
      <Tag
        className={cn(
          "font-display font-semibold tracking-tight",
          Tag === "h2" ? "text-3xl md:text-4xl" : "text-2xl md:text-3xl",
        )}
      >
        <span className="text-starlight">{title}</span>
        {emoji && <span className="ml-3 text-white">{emoji}</span>}
      </Tag>
      <span
        aria-hidden="true"
        className="relative mx-auto mt-5 block h-px w-28 bg-gradient-to-r from-transparent via-blue-400/70 to-transparent"
      >
        <span className="absolute left-1/2 top-1/2 h-[3px] w-[3px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_10px_2px_rgba(147,197,253,0.9)]" />
      </span>
    </motion.div>
  )
}
