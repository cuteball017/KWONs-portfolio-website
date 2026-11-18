"use client"

import { useEffect } from "react"
import { animate, motion, useMotionValue, useTransform } from "framer-motion"
import { useCopy } from "@/lib/i18n"
import { EASE } from "@/lib/motion"

/**
 * Intro overlay. The sky is already forming behind it; when the page is ready the overlay
 * dissolves instead of being swapped out, so there is no hard cut into the hero.
 */
export default function Loading() {
  const t = useCopy()
  const progress = useMotionValue(0)
  const width = useTransform(progress, (value) => `${value}%`)
  const percent = useTransform(progress, (value) => `${Math.round(value)}%`)

  useEffect(() => {
    // Reaches 100% just before page.tsx lifts the overlay (2s).
    const controls = animate(progress, 100, { duration: 1.75, ease: [0.4, 0, 0.2, 1] })
    return () => controls.stop()
  }, [progress])

  return (
    <motion.div
      role="status"
      aria-label="Loading"
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#03040c]/70"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.9, ease: EASE }}
    >
      <motion.div
        className="w-64"
        exit={{ opacity: 0, y: -10, filter: "blur(8px)" }}
        transition={{ duration: 0.6, ease: EASE }}
      >
        {/* Progress as a comet crossing a thin track */}
        <div className="h-px w-full rounded-full bg-white/10">
          <motion.div className="comet-trail" style={{ width }} />
        </div>

        <motion.div className="text-starlight mt-6 text-center font-display text-2xl font-light tabular-nums">
          {percent}
        </motion.div>

        <motion.div
          className="mt-2 text-center text-sm text-blue-100/60"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2.4, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        >
          {t.loading}
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
