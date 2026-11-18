"use client"

import { useEffect } from "react"

/** Every surface that carries the glass material (see "liquid glass" in app/globals.css). */
const GLASS = ".glass-panel, .glass-control, .glass-bar"

/**
 * Lets glass catch the light where the pointer is. Writes the pointer position, relative to each
 * glass surface under it, into --glass-x / --glass-y; the CSS turns that into a rim highlight and
 * a soft sheen. Mount once, anywhere.
 */
export function useGlassLight() {
  useEffect(() => {
    let frame = 0
    let x = 0
    let y = 0
    let target: Element | null = null

    const paint = () => {
      frame = 0
      // A control inside a panel: both are lit, each in its own coordinates.
      let glass = target?.closest<HTMLElement>(GLASS) ?? null
      while (glass) {
        const rect = glass.getBoundingClientRect()
        glass.style.setProperty("--glass-x", `${(x - rect.left).toFixed(1)}px`)
        glass.style.setProperty("--glass-y", `${(y - rect.top).toFixed(1)}px`)
        glass = glass.parentElement?.closest<HTMLElement>(GLASS) ?? null
      }
    }

    const follow = (event: PointerEvent) => {
      if (!(event.target instanceof Element)) return
      // Touch has no hover — there the light only shows under a press.
      if (event.type === "pointermove" && event.pointerType !== "mouse") return
      x = event.clientX
      y = event.clientY
      target = event.target
      if (!frame) frame = requestAnimationFrame(paint)
    }

    window.addEventListener("pointermove", follow, { passive: true })
    window.addEventListener("pointerdown", follow, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener("pointermove", follow)
      window.removeEventListener("pointerdown", follow)
    }
  }, [])
}
