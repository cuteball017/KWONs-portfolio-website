"use client"

import { useState } from "react"
import Link from "next/link"
import { Code, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ProjectCardProps {
  title: string
  description: string
  tags: string[]
  githubUrl?: string
  vercelUrl?: string
}

export function ProjectCard({ title, description, tags, githubUrl = "#", vercelUrl = "#" }: ProjectCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className="relative h-full rounded-lg border bg-card p-6 text-card-foreground shadow transition-all duration-300 group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
    >
      <div className={cn("transition-all duration-300", isHovered ? "blur-sm" : "")}>
        <h3 className="text-xl font-semibold">{title}</h3>
        <p className="mt-2 text-muted-foreground">{description}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {isHovered && (
        <div className="absolute inset-0 flex items-center justify-center gap-4 p-6">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2 bg-background/80 backdrop-blur-sm"
            asChild
          >
            <Link href={githubUrl}>
              <Code className="h-4 w-4" />
              <span>Code</span>
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2 bg-background/80 backdrop-blur-sm"
            asChild
          >
            <Link href={vercelUrl}>
              <ExternalLink className="h-4 w-4" />
              <span>View Service</span>
            </Link>
          </Button>
        </div>
      )}
    </div>
  )
}
