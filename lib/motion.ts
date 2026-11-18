import type { Variants } from "framer-motion"

/** One easing for the whole site: a long, soft deceleration. */
export const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

/** Reveal once, shortly after the element has entered the viewport. */
export const inView = { once: true, margin: "0px 0px -12% 0px" } as const

/** Parent that reveals its children one after another. */
export const stagger = (interval = 0.12, delay = 0): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: interval, delayChildren: delay } },
})

/** Text drifts up and comes into focus, like a lens settling. Use on text, not on glass panels. */
export const focusIn: Variants = {
  hidden: { opacity: 0, y: 18, filter: "blur(10px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 1.1, ease: EASE },
    transitionEnd: { filter: "none" },
  },
}

/** Cards and panels rise gently into place. */
export const riseIn: Variants = {
  hidden: { opacity: 0, y: 28, scale: 0.985 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.9, ease: EASE } },
}
