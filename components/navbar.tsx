"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, Github } from "lucide-react"
import { scroller } from "react-scroll"
import { LanguageToggle } from "@/components/language-toggle"
import { useCopy } from "@/lib/i18n"
import { EASE, focusIn, stagger } from "@/lib/motion"
import { cn } from "@/lib/utils"

// Section ids, in page order. Their labels come from lib/copy.ts (nav).
const sections = ["home", "about", "work", "qa"] as const

const iconVariants = {
  initial: { scale: 1, rotate: 0 },
  hover: { scale: 1.15, rotate: 5 },
}

// Hover styles only where there is a real hover; on touch they would stick after a tap.
const iconButton =
  "flex h-10 w-10 items-center justify-center rounded-full text-slate-300 transition-colors duration-500 active:bg-white/10 [@media(hover:hover)]:hover:bg-white/10 [@media(hover:hover)]:hover:text-white"

export default function Navbar() {
  const t = useCopy()
  const [isOpen, setIsOpen] = useState(false)
  const [active, setActive] = useState<string>(sections[0])
  const [lens, setLens] = useState(false)

  // The bar's rim refracts the page through an SVG filter used as backdrop-filter. Only Chromium
  // renders that today (navigator.userAgentData is its tell); everyone else gets plain frosted glass.
  useEffect(() => {
    setLens("userAgentData" in navigator)
  }, [])

  // Follow the section in view.
  useEffect(() => {
    let frame = 0

    const update = () => {
      frame = 0
      // While the mobile menu pins <body>, scrollY reads 0 — keep the last real state.
      if (document.body.style.position === "fixed") return

      const probe = window.innerHeight * 0.4
      let current: string = sections[0]
      for (const id of sections) {
        const section = document.getElementById(id)
        if (section && section.getBoundingClientRect().top <= probe) current = id
      }
      setActive(current)
    }

    const handleScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }

    update()
    window.addEventListener("scroll", handleScroll, { passive: true })
    window.addEventListener("resize", handleScroll)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener("scroll", handleScroll)
      window.removeEventListener("resize", handleScroll)
    }
  }, [])

  // Prevent body scrolling when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      // Save current scroll position
      const scrollY = window.scrollY

      // Disable scrolling on the body
      document.body.style.position = "fixed"
      document.body.style.top = `-${scrollY}px`
      document.body.style.width = "100%"
      document.body.style.overflow = "hidden"

      const closeOnEscape = (event: KeyboardEvent) => {
        if (event.key === "Escape") setIsOpen(false)
      }
      window.addEventListener("keydown", closeOnEscape)

      return () => {
        window.removeEventListener("keydown", closeOnEscape)
        // Re-enable scrolling when component unmounts or menu closes
        document.body.style.position = ""
        document.body.style.top = ""
        document.body.style.width = ""
        document.body.style.overflow = ""
        // Restore scroll position
        window.scrollTo(0, scrollY)
      }
    }
  }, [isOpen])

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault()
    const travel = () => scroller.scrollTo(id, { smooth: "easeInOutCubic", duration: 900 })

    if (isOpen) {
      // Close the mobile menu first, and wait for the body to unlock before scrolling
      setIsOpen(false)
      setTimeout(travel, 320)
    } else {
      travel()
    }
  }

  return (
    <>
      {/* A capsule of glass floating over the page. It slides in rather than fades: an ancestor
          with opacity below 1 would cut the glass off from the page it is meant to show through. */}
      <motion.header
        layoutRoot
        initial={{ y: "-160%" }}
        animate={{ y: 0 }}
        transition={{ duration: 1.1, ease: EASE, delay: 0.15 }}
        className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-3 pt-3 md:pt-4"
      >
        <nav
          className={cn(
            "glass-bar pointer-events-auto flex h-[3.25rem] w-full max-w-[46rem] items-center justify-between pl-5 pr-1.5 md:h-14 md:pl-7 md:pr-2",
            lens && "glass-bar--lens",
          )}
        >
          <span aria-hidden="true" className="glass-bar__lens" />
          <span aria-hidden="true" className="glass-bar__frost" />
          <span aria-hidden="true" className="glass-bar__shine" />

          <a
            href="#home"
            className="font-display text-xl font-semibold tracking-tight text-white md:text-[1.375rem]"
            onClick={(e) => scrollToSection(e, "home")}
          >
            KWON
            {/* the full stop, as a small star */}
            <span
              aria-hidden="true"
              className="ml-[3px] inline-block h-[5px] w-[5px] rounded-full bg-blue-400 shadow-[0_0_10px_2px_rgba(96,165,250,0.85)] motion-safe:animate-twinkle"
            />
          </a>

          {/* Desktop Navigation */}
          <div className="hidden items-center md:flex">
            {sections.map((id) => {
              const isActive = active === id
              return (
                <a
                  key={id}
                  href={`#${id}`}
                  aria-current={isActive ? "location" : undefined}
                  className={cn(
                    "relative rounded-full px-4 py-2 text-[0.95rem] transition-colors duration-500",
                    isActive ? "text-white" : "text-slate-300/80 hover:bg-white/[0.06] hover:text-white",
                  )}
                  onClick={(e) => scrollToSection(e, id)}
                >
                  {isActive && (
                    // One drop of glass shared by all links: it glides to whichever section is in view
                    <motion.span
                      layoutId="nav-marker"
                      transition={{ type: "spring", stiffness: 360, damping: 30 }}
                      style={{ borderRadius: 999 }}
                      className="glass-droplet absolute inset-0"
                    />
                  )}
                  <span className="relative">{t.nav[id]}</span>
                </a>
              )
            })}
            <LanguageToggle className="ml-1" />
            <motion.a
              href="https://github.com/cuteball017"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(iconButton, "ml-1")}
              aria-label="GitHub"
              variants={iconVariants}
              initial="initial"
              whileHover="hover"
              transition={{ duration: 0.5, ease: EASE }}
            >
              <Github size={20} />
            </motion.a>
          </div>

          {/* Mobile Navigation Toggle */}
          <div className="flex items-center md:hidden">
            <LanguageToggle className="px-2.5" />
            <motion.a
              href="https://github.com/cuteball017"
              target="_blank"
              rel="noopener noreferrer"
              className={iconButton}
              aria-label="GitHub"
              variants={iconVariants}
              initial="initial"
              whileHover="hover"
              transition={{ duration: 0.5, ease: EASE }}
            >
              <Github size={20} />
            </motion.a>
            <button
              className={cn(iconButton, "text-white focus:outline-none focus-visible:bg-white/10", isOpen && "bg-white/10")}
              onClick={() => setIsOpen(!isOpen)}
              aria-label={isOpen ? t.nav.closeMenu : t.nav.openMenu}
              aria-expanded={isOpen}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={isOpen ? "close" : "open"}
                  initial={{ opacity: 0, rotate: -45, scale: 0.8 }}
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  exit={{ opacity: 0, rotate: 45, scale: 0.8 }}
                  transition={{ duration: 0.18 }}
                  className="block"
                >
                  {isOpen ? <X size={22} /> : <Menu size={22} />}
                </motion.span>
              </AnimatePresence>
            </button>
          </div>
        </nav>
      </motion.header>

      {/* Mobile Navigation Menu — a sheet of glass that unfolds from the bar. The scrim and the
          sheet fade on their own (not through a shared wrapper) so each keeps its view of the page. */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="menu-scrim"
            aria-hidden="true"
            onClick={() => setIsOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="fixed inset-0 z-40 bg-[#03040c]/60 backdrop-blur-md md:hidden"
          />
        )}
        {isOpen && (
          <motion.div
            key="menu-sheet"
            initial={{ opacity: 0, scale: 0.9, y: -14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: -10, transition: { duration: 0.25, ease: EASE } }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            className="glass-panel fixed inset-x-3 top-[4.5rem] z-40 origin-top-right p-2 md:hidden"
          >
            <motion.div variants={stagger(0.05, 0.06)} initial="hidden" animate="show" className="flex flex-col">
              {sections.map((id) => {
                const isActive = active === id
                return (
                  <motion.a
                    key={id}
                    variants={focusIn}
                    href={`#${id}`}
                    aria-current={isActive ? "location" : undefined}
                    className={cn(
                      "relative flex items-center justify-between rounded-2xl px-4 py-3.5 font-display text-lg transition-colors duration-300",
                      isActive ? "text-white" : "text-slate-300 hover:text-white active:bg-white/[0.06]",
                    )}
                    onClick={(e) => scrollToSection(e, id)}
                  >
                    {isActive && <span aria-hidden="true" className="glass-droplet absolute inset-0 rounded-2xl" />}
                    <span className={cn("relative", isActive && "text-starlight")}>{t.nav[id]}</span>
                    {isActive && (
                      <span
                        aria-hidden="true"
                        className="relative h-[5px] w-[5px] rounded-full bg-blue-300 shadow-[0_0_10px_2px_rgba(96,165,250,0.85)]"
                      />
                    )}
                  </motion.a>
                )
              })}
              <motion.div
                variants={focusIn}
                aria-hidden="true"
                className="mx-4 my-1.5 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent"
              />
              <motion.a
                variants={focusIn}
                href="https://github.com/cuteball017"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-2xl px-4 py-3.5 text-slate-300 transition-colors duration-300 hover:text-white active:bg-white/[0.06]"
              >
                <Github size={20} />
                <span>GitHub</span>
              </motion.a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Displacement map for the bar's rim. It is assembled from flat colours and offsets, with no
          lengths that depend on the bar, so the same filter fits every width: a strip along each
          edge pushes the backdrop inwards (red drives x, green drives y) and a blur turns the
          strips into a slope. */}
      {lens && (
        <svg aria-hidden="true" width="0" height="0" className="pointer-events-none absolute">
          <filter id="liquid-lens" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
            <feFlood floodColor="#808080" result="flat" />
            <feOffset in="flat" dx="7" result="leftGap" />
            <feOffset in="flat" dx="-7" result="rightGap" />
            <feOffset in="flat" dy="7" result="topGap" />
            <feOffset in="flat" dy="-7" result="bottomGap" />

            <feFlood floodColor="#ff8080" result="pushRight" />
            <feComposite in="pushRight" in2="leftGap" operator="out" result="left" />
            <feFlood floodColor="#008080" result="pushLeft" />
            <feComposite in="pushLeft" in2="rightGap" operator="out" result="right" />
            <feMerge result="xSteps">
              <feMergeNode in="flat" />
              <feMergeNode in="left" />
              <feMergeNode in="right" />
            </feMerge>
            <feGaussianBlur in="xSteps" stdDeviation="4 0" result="xMap" />

            <feFlood floodColor="#80ff80" result="pushDown" />
            <feComposite in="pushDown" in2="topGap" operator="out" result="top" />
            <feFlood floodColor="#800080" result="pushUp" />
            <feComposite in="pushUp" in2="bottomGap" operator="out" result="bottom" />
            <feMerge result="ySteps">
              <feMergeNode in="flat" />
              <feMergeNode in="top" />
              <feMergeNode in="bottom" />
            </feMerge>
            <feGaussianBlur in="ySteps" stdDeviation="0 4" result="yMap" />

            <feDisplacementMap in="SourceGraphic" in2="xMap" scale="18" xChannelSelector="R" yChannelSelector="B" result="bentX" />
            <feDisplacementMap in="bentX" in2="yMap" scale="18" xChannelSelector="B" yChannelSelector="G" />
          </filter>
        </svg>
      )}
    </>
  )
}
