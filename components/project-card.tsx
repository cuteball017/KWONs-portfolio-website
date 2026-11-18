"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Code, ExternalLink } from "lucide-react"
import { useCopy } from "@/lib/i18n"
import { EASE, riseIn } from "@/lib/motion"

interface ProjectCardProps {
  title: string
  description: string
  tags: string[]
  githubUrl?: string
  vercelUrl?: string
}

const actionButton = "glass-control h-9 px-4 text-sm"

// Hover (or keyboard focus) lets the text fall out of focus while the links come forward.
// The reveal itself lives in globals.css (.project-card) so touch screens get a plain row of links instead.
// Each button appears only when its URL is given.
export function ProjectCard({ title, description, tags, githubUrl, vercelUrl }: ProjectCardProps) {
  const t = useCopy()
  return (
    <motion.div
      variants={riseIn}
      whileHover={{ y: -4, transition: { duration: 0.5, ease: EASE } }}
      className="project-card glass-panel h-full p-6"
    >
      {/* The body fills the card and the tags sit at its foot, so cards side by side line their
          tags up whatever the length of their descriptions. */}
      <div className="project-card__body flex flex-1 flex-col">
        <h3 className="text-balance font-display text-xl font-semibold text-white">{title}</h3>
        <p className="mt-2 text-pretty leading-relaxed text-slate-400">{description}</p>
        <div className="mt-auto flex flex-wrap gap-2 pt-4">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center rounded-full bg-blue-300/[0.08] px-2.5 py-0.5 text-xs font-medium text-blue-100/80 shadow-[inset_0_1px_0.5px_rgba(255,255,255,0.16),inset_0_0_0_1px_rgba(147,197,253,0.1)]"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {(githubUrl || vercelUrl) && (
        <div className="project-card__actions">
          {githubUrl && (
            <Link href={githubUrl} className={actionButton}>
              <Code className="h-4 w-4" />
              <span>{t.work.code}</span>
            </Link>
          )}
          {vercelUrl && (
            <Link href={vercelUrl} className={actionButton}>
              <ExternalLink className="h-4 w-4" />
              <span>{t.work.viewService}</span>
            </Link>
          )}
        </div>
      )}
    </motion.div>
  )
}
