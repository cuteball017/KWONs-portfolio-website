"use client"
import { ShootingStars } from "@/components/ui/shooting-stars"
import { StarsBackground } from "@/components/ui/stars-background"

export default function StarBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <div className="absolute inset-0 bg-black"></div>
      <ShootingStars starColor="#3b82f6" trailColor="#60a5fa" minDelay={800} maxDelay={3000} />
      <StarsBackground starDensity={0.0002} allStarsTwinkle={true} />
    </div>
  )
}
