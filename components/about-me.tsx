"use client"

import { useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { BadgeCheck, Briefcase, GraduationCap, Trophy, type LucideIcon } from "lucide-react"
import { SectionHeading } from "@/components/section-heading"
import type { Copy } from "@/lib/copy"
import { useCopy } from "@/lib/i18n"
import { EASE, focusIn, inView, riseIn, stagger } from "@/lib/motion"

type ProfileTopic = keyof Copy["about"]["profile"]

// The profile beside the portrait, one row per topic in this order. The text is in lib/copy.ts
// (about.profile); keep lib/profile.ts (what the chatbot knows) in step with it.
const profileIcons: Record<ProfileTopic, LucideIcon> = {
  education: GraduationCap,
  experience: Briefcase,
  awards: Trophy,
  certifications: BadgeCheck,
}

const skillsData: Record<keyof Copy["about"]["skillGroups"], { name: string; proficiency: number }[]> = {
  languages: [
    { name: "TypeScript", proficiency: 80 },
    { name: "JavaScript", proficiency: 72 },
    { name: "python", proficiency: 68 },
    { name: "Java", proficiency: 40 },
    { name: "Dart", proficiency: 20 },
  ],
  frameworks: [
    { name: "React", proficiency: 75 },
    { name: "Next.js", proficiency: 70 },
    { name: "Node.js", proficiency: 65 },
  ],
  tools: [
    { name: "Git", proficiency: 75 },
    { name: "Docker", proficiency: 15 },
  ],
}

export default function AboutMe() {
  const t = useCopy()
  // If the portrait can't be loaded, show a monogram tile instead of a broken-image icon.
  const [portraitFailed, setPortraitFailed] = useState(false)

  return (
    <div>
      <SectionHeading title={t.about.heading} emoji="☕💻" />

      {/* Profile Section */}
      {/* Side by side from md up: the portrait grows with the screen (about three quarters of the
          profile's height on wide screens) and the profile takes the rest of the row. */}
      <div className="mb-20 flex flex-col items-center gap-10 md:mb-24 md:flex-row-reverse md:gap-12 lg:gap-16 xl:gap-20">
        <motion.div
          variants={riseIn}
          initial="hidden"
          whileInView="show"
          viewport={inView}
          // Side by side, the portrait centres on the list of rows rather than on the whole profile:
          // md:pt-28 matches the name block above the list (name 2.5rem + 0.5rem gap + title 1.5rem
          // + the list's 2.5rem top margin = 7rem), so the extra space above it balances that block.
          className="flex w-full justify-center md:w-auto md:shrink-0 md:pt-28"
        >
          {/* The portrait floats, with a soft blue halo behind it */}
          <div className="relative h-48 w-48 motion-safe:animate-float md:h-60 md:w-60 lg:h-80 lg:w-80 xl:h-[23rem] xl:w-[23rem]">
            <div aria-hidden="true" className="absolute -inset-8 rounded-full bg-blue-500/20 blur-3xl lg:-inset-12" />
            {portraitFailed ? (
              <div
                role="img"
                aria-label="KWON WOOSUB"
                className="relative flex h-full w-full items-center justify-center rounded-[2rem] bg-gradient-to-br from-blue-400/15 to-blue-600/5 shadow-[0_30px_80px_-30px_rgba(37,99,235,0.75)] ring-1 ring-white/10 lg:rounded-[2.5rem]"
              >
                <span className="text-starlight font-display text-5xl font-semibold tracking-tight md:text-6xl lg:text-7xl xl:text-8xl">
                  KW
                </span>
              </div>
            ) : (
              <Image
                src="https://storage.cloud.google.com/pfo-img/portfolio_img.jpg"
                alt="KWON WOOSUB"
                width={368}
                height={368}
                onError={() => setPortraitFailed(true)}
                className="relative h-full w-full rounded-[2rem] object-cover shadow-[0_30px_80px_-30px_rgba(37,99,235,0.75)] ring-1 ring-white/10 lg:rounded-[2.5rem]"
              />
            )}
          </div>
        </motion.div>

        {/* Profile: name and title, then one row per topic like a résumé */}
        <motion.div
          variants={stagger(0.1)}
          initial="hidden"
          whileInView="show"
          viewport={inView}
          className="w-full min-w-0 text-center md:flex-1 md:text-left"
        >
          <motion.div variants={focusIn}>
            <h3 className="font-display text-3xl font-semibold tracking-tight text-white md:text-4xl">KWON WOOSUB</h3>
            <p className="mt-2 text-sm font-medium uppercase tracking-[0.22em] text-blue-200/75 md:text-base [&:lang(ja)]:tracking-[0.1em]">
              {t.about.title}
            </p>
          </motion.div>

          <dl className="mt-8 md:mt-10">
            {(Object.keys(profileIcons) as ProfileTopic[]).map((topic) => {
              const Icon = profileIcons[topic]
              const { label, items } = t.about.profile[topic]
              return (
                <motion.div
                  key={topic}
                  variants={focusIn}
                  className="grid gap-3 border-t border-blue-200/[0.09] py-5 md:grid-cols-[11rem_1fr] md:gap-6"
                >
                  <dt className="flex items-center justify-center gap-2.5 text-xs font-medium uppercase tracking-[0.2em] text-blue-200/60 md:justify-start md:pt-1 [&:lang(ja)]:text-[0.8rem] [&:lang(ja)]:tracking-[0.08em]">
                    <Icon aria-hidden="true" className="h-4 w-4 text-blue-300/70" />
                    {label}
                  </dt>
                  <dd className="space-y-3">
                    {items.map((item) => (
                      <div key={item.title}>
                        <p className="font-medium text-white">{item.title}</p>
                        <p className="mt-0.5 text-sm leading-relaxed text-slate-400">{item.detail}</p>
                      </div>
                    ))}
                  </dd>
                </motion.div>
              )
            })}
          </dl>
        </motion.div>
      </div>

      {/* Skills Section */}
      <div>
        <SectionHeading as="h3" title={t.about.skillsHeading} emoji="⚔️" />
        <motion.div
          variants={stagger(0.12)}
          initial="hidden"
          whileInView="show"
          viewport={inView}
          className="grid grid-cols-1 gap-6 md:grid-cols-3"
        >
          {(Object.keys(skillsData) as (keyof typeof skillsData)[]).map((group) => (
            <motion.div key={group} variants={riseIn} className="glass-panel p-5 md:p-7">
              <h4 className="mb-5 text-center font-display text-lg font-medium text-blue-200 md:text-left md:text-xl">
                {t.about.skillGroups[group]}
              </h4>
              {skillsData[group].map((skill, index) => (
                <SkillBar key={skill.name} name={skill.name} proficiency={skill.proficiency} delay={0.3 + index * 0.09} />
              ))}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}

type SkillBarProps = {
  name: string
  proficiency: number
  delay?: number
}

function SkillBar({ name, proficiency, delay = 0 }: SkillBarProps) {
  return (
    <div className="mb-4 last:mb-0">
      <div className="mb-2 flex justify-between">
        <span className="text-sm text-slate-200 md:text-base">{name}</span>
        <span className="text-sm tabular-nums text-slate-400 md:text-base">{proficiency}%</span>
      </div>
      {/* Each bar is drawn as a small comet: a fading trail with a bright head */}
      <div className="h-[3px] rounded-full bg-white/[0.07]">
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          whileInView={{ width: `${proficiency}%`, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, ease: EASE, delay }}
          className="comet-trail"
        />
      </div>
    </div>
  )
}
