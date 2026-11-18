"use client"

import { motion, useReducedMotion } from "framer-motion"
import { EASE } from "@/lib/motion"

// One full lap around an ellipse centred on (600, 260).
const orbitPath = (rx: number, ry: number, clockwise: boolean) => {
  const sweep = clockwise ? 1 : 0
  return `M ${600 - rx},260 a ${rx},${ry} 0 1,${sweep} ${rx * 2},0 a ${rx},${ry} 0 1,${sweep} ${-rx * 2},0`
}

interface BodyProps {
  rx: number
  ry: number
  period: number
  clockwise?: boolean
  fill: string
  size: number
}

// A small body on its orbit. It grows and brightens on the near side (bottom), fades on the far side.
function OrbitingBody({ rx, ry, period, clockwise = false, fill, size }: BodyProps) {
  const still = useReducedMotion()
  const dur = `${period}s`
  // Counter-clockwise laps reach the near side first, clockwise laps the far side.
  const near = clockwise ? 0.75 : 0.25
  const far = clockwise ? 0.25 : 0.75
  const keyTimes = `0;${Math.min(near, far)};0.5;${Math.max(near, far)};1`
  const first = near < far ? 1 : 0.3
  const second = near < far ? 0.3 : 1

  return (
    <g opacity={still ? 0.7 : undefined} transform={still ? `translate(${600 - rx * 0.62} ${260 + ry * 0.78})` : undefined}>
      <circle r={size * 5} fill="url(#orbit-glow)" />
      <circle r={size} fill={fill} />
      {!still && (
        <>
          <animateMotion dur={dur} repeatCount="indefinite" path={orbitPath(rx, ry, clockwise)} />
          <animate
            attributeName="opacity"
            dur={dur}
            repeatCount="indefinite"
            keyTimes={keyTimes}
            values={`0.65;${first};0.65;${second};0.65`}
          />
        </>
      )}
    </g>
  )
}

/** Two faint orbits around the hero title, each carrying a small body. Purely decorative. */
export function OrbitRings() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute left-1/2 top-1/2 w-[max(46rem,84vw)] max-w-[80rem] -translate-x-1/2 -translate-y-1/2"
    >
      <motion.svg
        viewBox="0 0 1200 520"
        className="h-auto w-full overflow-visible"
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2.6, ease: EASE, delay: 0.5 }}
      >
        <defs>
          {/* The far half of each orbit is fainter than the near half. */}
          <linearGradient id="orbit-stroke" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#bfdbfe" stopOpacity="0.05" />
            <stop offset="1" stopColor="#bfdbfe" stopOpacity="0.24" />
          </linearGradient>
          <linearGradient id="orbit-dots" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#bfdbfe" stopOpacity="0.14" />
            <stop offset="1" stopColor="#bfdbfe" stopOpacity="0.5" />
          </linearGradient>
          <radialGradient id="orbit-glow">
            <stop offset="0" stopColor="#bfdbfe" stopOpacity="0.55" />
            <stop offset="0.35" stopColor="#93c5fd" stopOpacity="0.16" />
            <stop offset="1" stopColor="#93c5fd" stopOpacity="0" />
          </radialGradient>
        </defs>
        <g transform="rotate(-9 600 260)">
          <ellipse cx="600" cy="260" rx="560" ry="196" fill="none" stroke="url(#orbit-stroke)" strokeWidth="1" />
          <ellipse
            cx="600"
            cy="260"
            rx="410"
            ry="132"
            fill="none"
            stroke="url(#orbit-dots)"
            strokeWidth="1.5"
            strokeDasharray="0.1 11"
            strokeLinecap="round"
          />
          <OrbitingBody rx={560} ry={196} period={70} fill="#dbeafe" size={3.6} />
          <OrbitingBody rx={410} ry={132} period={46} clockwise fill="#93c5fd" size={2.6} />
        </g>
      </motion.svg>
    </div>
  )
}
