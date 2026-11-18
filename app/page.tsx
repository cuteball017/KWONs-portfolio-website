"use client"
import type React from "react"
import { useState, useEffect } from "react"
import { AnimatePresence, MotionConfig, motion } from "framer-motion"
import { scroller } from "react-scroll"
import Navbar from "@/components/navbar"
import { ProjectCard } from "@/components/project-card"
import AboutMe from "@/components/about-me"
import Loading from "@/components/loading"
import StarBackground from "@/components/star-background"
import ChatBot from "@/components/chat-bot"
import { OrbitRings } from "@/components/hero-decor"
import { SectionHeading } from "@/components/section-heading"
import { useGlassLight } from "@/hooks/use-glass-light"
import type { Copy } from "@/lib/copy"
import { useCopy } from "@/lib/i18n"
import { focusIn, inView, riseIn, stagger } from "@/lib/motion"

const heroButton = "px-7 py-3 text-base sm:px-8 sm:py-3.5 sm:text-lg"

const GITHUB_URL = "https://github.com/cuteball017"

// The work cards, in order. Titles, descriptions and tags are in lib/copy.ts (work.projects).
const projects: { id: keyof Copy["work"]["projects"]; githubUrl?: string; vercelUrl?: string }[] = [
  { id: "atta", vercelUrl: "https://okaery.co.jp/atta#problem-1" },
  { id: "copiru", vercelUrl: "https://copiru.com/ja" },
  { id: "blog", githubUrl: GITHUB_URL, vercelUrl: "https://kwons-portfolio-website.vercel.app/" },
]

const travelTo = (id: string) => (event: React.MouseEvent<HTMLAnchorElement>) => {
  event.preventDefault()
  scroller.scrollTo(id, { smooth: "easeInOutCubic", duration: 900 })
}

export default function Home() {
  const t = useCopy()
  const [loading, setLoading] = useState(true)
  useGlassLight()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    const timer = setTimeout(() => {
      setLoading(false)
    }, 2000) // Show loading for 2 seconds

    return () => clearTimeout(timer)
  }, [])

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative min-h-screen overflow-x-hidden text-white">
        {/* The sky is there from the first frame; the loader dissolves on top of it.
            Over the hero, a moving mouse stirs up stardust. */}
        <StarBackground stardust="#home" />
        <AnimatePresence>{loading && <Loading key="loading" />}</AnimatePresence>

        {!loading && (
          <>
            <Navbar />

            {/* Hero Section */}
            <section
              id="home"
              className="relative flex min-h-screen items-center justify-center overflow-hidden supports-[min-height:100svh]:min-h-[100svh]"
            >
              <OrbitRings />
              <motion.div
                variants={stagger(0.16, 0.3)}
                initial="hidden"
                animate="show"
                className="container relative z-10 mx-auto px-4 text-center"
              >
                <h1 className="font-display">
                  <motion.span
                    variants={focusIn}
                    className="block text-base font-light tracking-[0.28em] text-blue-100/70 sm:text-lg md:text-2xl [&:lang(ja)]:tracking-[0.12em]"
                  >
                    {t.hero.greeting}
                  </motion.span>
                  <motion.span variants={focusIn} className="mt-3 block">
                    <span className="text-starlight block text-[clamp(2.4rem,9.4vw,6.25rem)] font-semibold leading-[1.08] tracking-tight drop-shadow-[0_0_34px_rgba(59,130,246,0.38)] md:text-[clamp(2.4rem,8.4vw,5.5rem)] 2xl:text-[6.25rem]">
                      KWON WOOSUB
                    </span>
                  </motion.span>
                </h1>
                {/* Each button comes into focus by itself: a fading wrapper would cut their glass off
                    from the sky behind it. */}
                <div className="mt-10 flex flex-wrap justify-center gap-4">
                  <motion.a
                    variants={focusIn}
                    href="#about"
                    onClick={travelTo("about")}
                    className={`glass-control glass-control--tint ${heroButton}`}
                  >
                    {t.hero.about}
                  </motion.a>
                  <motion.a
                    variants={focusIn}
                    href="#qa"
                    onClick={travelTo("qa")}
                    className={`glass-control ${heroButton}`}
                  >
                    {t.hero.qa}
                  </motion.a>
                </div>
              </motion.div>
            </section>

            {/* Everything below the hero shares one veil over the sky, so sections flow into each other */}
            <div className="content-veil relative z-10">
              {/* About Section */}
              <section id="about" className="py-20 md:py-28">
                <div className="container px-4 mx-auto">
                  <AboutMe />
                </div>
              </section>

              {/* Work Section */}
              <section id="work" className="py-20 md:py-28">
                <div className="container px-4 mx-auto">
                  <SectionHeading title={t.work.heading} emoji="🏗️" />
                  <motion.div
                    variants={stagger(0.1)}
                    initial="hidden"
                    whileInView="show"
                    viewport={inView}
                    // Three projects side by side on wide screens. Narrower screens stack them (two
                    // columns would leave one card alone), kept to a readable width.
                    className="mx-auto grid max-w-2xl grid-cols-1 gap-6 md:gap-8 lg:max-w-none lg:grid-cols-3"
                  >
                    {projects.map(({ id, ...links }) => (
                      <ProjectCard key={id} {...t.work.projects[id]} {...links} />
                    ))}
                  </motion.div>
                </div>
              </section>

              {/* Q&A with AI Section (replacing Contact) */}
              <section id="qa" className="py-20 md:py-28">
                <div className="container px-4 mx-auto">
                  <SectionHeading title={t.qa.heading} emoji="🤖" />
                  <motion.div
                    variants={riseIn}
                    initial="hidden"
                    whileInView="show"
                    viewport={inView}
                    className="glass-panel max-w-3xl mx-auto p-3 md:p-6"
                  >
                    <p className="text-center text-slate-300 mb-4 md:mb-5">{t.qa.intro}</p>
                    <ChatBot />
                  </motion.div>
                </div>
              </section>

              {/* Footer */}
              <footer className="py-8 md:py-12">
                <div className="container px-4 mx-auto">
                  <div
                    aria-hidden="true"
                    className="mx-auto mb-8 h-px max-w-3xl bg-gradient-to-r from-transparent via-blue-400/25 to-transparent md:mb-12"
                  />
                  <div className="text-center text-slate-400 text-sm">
                    <p>© {new Date().getFullYear()} KWON WOOSUB. All rights reserved.</p>
                    <div className="mt-2">
                      <a
                        href="mailto:kwskmw001@gmail.com"
                        className="text-blue-300 transition-colors duration-300 hover:text-blue-200"
                      >
                        kwskmw001@gmail.com
                      </a>
                    </div>
                  </div>
                </div>
              </footer>
            </div>
          </>
        )}
      </div>
    </MotionConfig>
  )
}

// type ProjectCardProps = {
//   title: string;
//   description: string;
//   tags: string[]; githubUrl?: string
//   vercelUrl?: string
// };

// function ProjectCard2({ title, description, tags }: ProjectCardProps) {
//   return (
//     <div className="p-4 md:p-6 rounded-lg bg-gray-900/50 backdrop-blur-sm border border-gray-800 hover:border-blue-500 transition-all duration-300">
//       <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3 text-white text-center md:text-left">{title}</h3>
//       <p className="text-sm md:text-base text-gray-400 mb-3 md:mb-4 text-center md:text-left">{description}</p>
//       <div className="flex flex-wrap justify-center md:justify-start gap-2">
//         {tags.map((tag, index) => (
//           <span
//             key={index}
//             className="text-xs px-2 py-1 rounded-full bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-blue-300"
//           >
//             {tag}
//           </span>
//         ))}
//       </div>
//     </div>
//   );
// }
