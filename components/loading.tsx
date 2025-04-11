"use client"

import { useEffect, useState } from "react"
import { motion, useAnimation } from "framer-motion"

export default function Loading() {
  const [progress, setProgress] = useState(0)
  const controls = useAnimation()

  useEffect(() => {
    const duration = 12 // Total duration in seconds
    const interval = 50 // Update interval in milliseconds

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 100 / ((duration * 500) / interval)
        if (next >= 100) {
          clearInterval(timer)
          return 100
        }
        return next
      })
    }, interval)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    controls.start({ width: `${progress}%` })
  }, [progress, controls])

  return (
    <div className="fixed inset-0 bg-[#1a2235] z-50 flex flex-col items-center justify-center">
      <div className="w-64 relative">
        {/* Main loading bar container */}
        <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden relative">
          {/* Gradient background */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600"
            initial={{ x: "-100%" }}
            animate={{ x: "0%" }}
            transition={{
              repeat: Number.POSITIVE_INFINITY,
              duration: 6,
              ease: "linear",
            }}
          />

          {/* Progress bar */}
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-blue-700"
            initial={{ width: 0 }}
            animate={controls}
            transition={{ duration: 0.1 }}
          />

          {/* Glow effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-blue-700/20 blur-sm"
            initial={{ width: 0 }}
            animate={controls}
            transition={{ duration: 0.1 }}
          />
        </div>

        {/* Percentage text */}
        <div className="mt-4 text-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-blue-700 bg-clip-text text-transparent"
          >
            {Math.round(progress)}%
          </motion.div>
        </div>

        {/* Loading text with glitch effect */}
        <motion.div
          className="mt-2 text-center text-gray-400 text-sm relative"
          animate={{
            textShadow: [
              "0 0 0px rgba(59, 130, 246, 0)",
              "0 0 2px rgba(59, 130, 246, 0.5)",
              "0 0 0px rgba(59, 130, 246, 0)",
            ],
          }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        >
          Loading...
        </motion.div>
      </div>
    </div>
  )
}
