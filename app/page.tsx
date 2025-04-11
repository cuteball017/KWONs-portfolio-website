"use client"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Link as ScrollLink } from "react-scroll"
import Navbar from "@/components/navbar"
import { Button } from "@/components/ui/button"
import AboutMe from "@/components/about-me"
import Loading from "@/components/loading"
import StarBackground from "@/components/star-background"
import ChatBot from "@/components/chat-bot"
import { useMediaQuery } from "@/hooks/use-media-query"

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const isMobile = useMediaQuery("(max-width: 768px)")

  useEffect(() => {
    setMounted(true)
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    const timer = setTimeout(() => {
      setLoading(false)
    }, 2000) // Show loading for 2 seconds

    return () => clearTimeout(timer)
  }, [])

  if (!mounted) return null
  if (loading) return <Loading />

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <StarBackground />
      <Navbar />

      {/* Hero Section */}
      <section id="home" className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="container relative z-10 px-4 mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600">
              Hello! It's KWON WOOSUB
            </h1>
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <ScrollLink to="about" smooth={true} duration={500}>
                <Button
                  className="text-lg px-6 py-3 rounded-xl sm:text-xl sm:px-8 sm:py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                >
                  About Me
                </Button>
              </ScrollLink>
              <ScrollLink to="qa" smooth={true} duration={500}>
                <Button
                  variant="outline"
                  className="text-lg px-6 py-3 rounded-xl sm:text-xl sm:px-8 sm:py-4 bg-transparent border-2 border-blue-500 text-white hover:bg-blue-500 hover:text-white transition-all duration-300"
                >
                  Q&A with AI
                </Button>
              </ScrollLink>
            </div>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="relative py-16 md:py-20 bg-black/80">
        <div className="container px-4 mx-auto">
          <AboutMe />
        </div>
      </section>

      {/* Work Section */}
      <section id="work" className="relative z-10 py-16 md:py-20 bg-black/90">
        <div className="container px-4 mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative z-10"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-8 md:mb-12 text-center">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-600">
                What I've Built
              </span>
              <span className="ml-2 text-white">🏗️</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              <ProjectCard
                title="Serverless Web3 Blog"
                description="Decentralized blogging platform with permanent storage on Arweave and crypto micropayments."
                tags={["Next.js", "Firebase", "Arweave", "Web3"]}
              />
              <ProjectCard
                title="Cross-Chain Bridge"
                description="Secure bridge for asset transfers between different blockchain networks."
                tags={["Cross-Chain", "Interoperability", "DeFi"]}
              />
              <ProjectCard
                title="Decentralized Identity Solution"
                description="Self-sovereign identity solution using blockchain technology."
                tags={["DID", "Identity", "Blockchain"]}
              />
              <ProjectCard
                title="Solidity Code Generator"
                description="Tool for rapid development and testing of secure smart contracts."
                tags={["Solidity", "Smart Contracts", "Development"]}
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Q&A with AI Section (replacing Contact) */}
      <section id="qa" className="relative z-10 py-16 md:py-20 bg-black/80">
        <div className="container px-4 mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative z-10"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-600">
                Q&A with AI
              </span>
              <span className="ml-2 text-white">🤖</span>
            </h2>
            <div className="max-w-3xl mx-auto">
              <div className="bg-gray-900/50 backdrop-blur-sm p-3 md:p-6 rounded-lg border border-gray-800">
                <p className="text-center text-gray-300 mb-4">
                  Ask me anything about KWON WOOSUB's skills, experience, or interests!
                </p>
                <ChatBot />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-8 md:py-12 bg-black">
        <div className="container px-4 mx-auto">
          <div className="text-center text-gray-400 text-sm">
            <p>© {new Date().getFullYear()} KWON WOOSUB. All rights reserved.</p>
            <div className="mt-2">
              <a href="mailto:kwskmw001@gmail.com" className="text-blue-400 hover:text-blue-300">
                kwskmw001@gmail.com
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

type ProjectCardProps = {
  title: string;
  description: string;
  tags: string[];
};

function ProjectCard({ title, description, tags }: ProjectCardProps) {
  return (
    <div className="p-4 md:p-6 rounded-lg bg-gray-900/50 backdrop-blur-sm border border-gray-800 hover:border-blue-500 transition-all duration-300">
      <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3 text-white text-center md:text-left">{title}</h3>
      <p className="text-sm md:text-base text-gray-400 mb-3 md:mb-4 text-center md:text-left">{description}</p>
      <div className="flex flex-wrap justify-center md:justify-start gap-2">
        {tags.map((tag, index) => (
          <span
            key={index}
            className="text-xs px-2 py-1 rounded-full bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-blue-300"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
