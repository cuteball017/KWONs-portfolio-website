"use client"

import { useEffect, useRef } from "react"
import { createCosmos } from "@/lib/cosmos"

interface StarBackgroundProps {
  /** CSS selector of the area where a moving mouse stirs up stardust. */
  stardust?: string
}

/**
 * Fixed deep-space backdrop behind the whole page.
 * The markup is static; lib/cosmos.ts paints and animates the two canvases.
 */
export default function StarBackground({ stardust }: StarBackgroundProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const skyRef = useRef<HTMLCanvasElement>(null)
  const starsRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const root = rootRef.current
    const sky = skyRef.current
    const stars = starsRef.current
    if (!root || !sky || !stars) return

    // One seed per visit: a new sky every time, but the same sky if motion settings change.
    const seed = (Math.random() * 0xffffffff) >>> 0
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)")
    const start = () => createCosmos({ root, sky, stars, seed, still: reducedMotion.matches, dustZone: stardust })
    let stop = start()

    const restart = () => {
      stop()
      stop = start()
    }
    reducedMotion.addEventListener("change", restart)

    return () => {
      reducedMotion.removeEventListener("change", restart)
      stop()
    }
  }, [stardust])

  return (
    <div ref={rootRef} aria-hidden="true" className="cosmos">
      <canvas ref={skyRef} className="cosmos-sky" />
      <canvas ref={starsRef} className="cosmos-stars" />
      <div className="cosmos-vignette" />
    </div>
  )
}
