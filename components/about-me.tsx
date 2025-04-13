"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { useMediaQuery } from "@/hooks/use-media-query"

const skillsData = {
  "Programming Languages": [
    { name: "TypeScript", proficiency: 80 },
    { name: "JavaScript", proficiency: 72 },
    { name: "python", proficiency: 68 },
    { name: "Java", proficiency: 40 },
    { name: "Dart", proficiency: 20 },
  ],
  "Frameworks/Libraries": [
    { name: "React", proficiency: 75 },
    { name: "Next.js", proficiency: 70 },
    { name: "Node.js", proficiency: 65 },
  ],
  Tools: [
    { name: "Git", proficiency: 75 },
    { name: "Docker", proficiency: 15 },
  ],
}

export default function AboutMe() {
  const isMobile = useMediaQuery("(max-width: 768px)")

  return (
    <section id="about" className="relative z-10 py-12">
      <div className="container px-4 mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="relative z-10"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-600">About Me</span>
            <span className="ml-2">☕💻</span>
          </h2>
          {/* Profile Section */}
          <div className="flex flex-col md:flex-row-reverse items-center gap-8 mb-16">
            <div className="md:w-1/3 w-full flex justify-center">
              <div className="relative w-48 h-48 md:w-64 md:h-64">
                <Image
                  src="https://storage.cloud.google.com/pfo-img/portfolio_img.jpg"
                  alt="KWON WOOSUB"
                  width={256}
                  height={256}
                  className="rounded-lg object-cover shadow-lg"
                />
              </div>
            </div>
            <div className="md:w-2/3 w-full">
              <div className="prose prose-invert max-w-none text-center md:text-left">
                {/* Mobile description - improved for better readability */}
                <div className="md:hidden px-2">
                  <p className="text-lg mb-2">
                    <strong>Blockchain Sorcerer 🧙‍♂️ and Full Stack Dev 💻</strong>
                  </p>
                  <p className="text-sm text-gray-300 mb-2">
                    Building secure, scalable solutions in the crypto-verse. From DeFi to Web3, turning complex tech
                    into seamless experiences.
                  </p>
                  <p className="text-sm text-gray-300">
                    Passionate about decentralized technologies and creating innovative solutions. ⛓⚡🔥
                  </p>
                </div>
                {/* Desktop description */}
                <div className="hidden md:block">
                  <p className="text-xl mb-4">
                    🚀 <strong>Hey, I'm KWON WOOSUB!</strong>
                  </p>
                  <p className="mb-4">
                    A <strong>Blockchain Wizard 🧙‍♂️</strong> and <strong>Full Stack Alchemist 💻</strong>, turning{" "}
                    <strong>lines of code</strong> into <strong>decentralized magic</strong>! Whether it's{" "}
                    <strong>smart contracts</strong>, <strong>ZK proofs</strong>, or <strong>FHE sorcery</strong>, I
                    love pushing Web3 to the next level.
                  </p>
                  <p className="mb-4">
                    I spend my days <strong>hacking away in Solidity, Go, and Rust</strong>—and my nights wondering why
                    gas fees still exist. 😅 When I'm not coding, I'm probably deep-diving into{" "}
                    <strong>DeFi rabbit holes</strong>, contributing to <strong>open-source chaos</strong>, or
                    evangelizing blockchain to anyone who'll listen (or can't escape).
                  </p>
                  <p>
                    Let's <strong>connect, build, and break things</strong>—because the{" "}
                    <strong>future is decentralized, and I refuse to be left behind!</strong> ⛓⚡🔥
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Skills Section */}
          <div>
            <h3 className="text-2xl md:text-3xl font-bold mb-8 text-center">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-600">
                Code Arsenal
              </span>
              <span className="ml-2 text-white">⚔️</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.entries(skillsData).map(([category, skills]) => (
                <div
                  key={category}
                  className="p-4 md:p-6 bg-gray-900/50 rounded-xl backdrop-blur-sm border border-gray-800"
                >
                  <h4 className="text-lg md:text-xl font-bold mb-4 text-blue-400 text-center md:text-left">
                    {category}
                  </h4>
                  {skills.map((skill) => (
                    <SkillBar key={skill.name} name={skill.name} proficiency={skill.proficiency} />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

type SkillBarProps = {
  name: string;
  proficiency: number;
};

function SkillBar({ name, proficiency }: SkillBarProps) {
  return (
    <div className="mb-3">
      <div className="flex justify-between mb-1">
        <span className="text-gray-300 text-sm md:text-base">{name}</span>
        <span className="text-gray-400 text-sm md:text-base">{proficiency}%</span>
      </div>
      <div className="h-1.5 md:h-2 bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${proficiency}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
        />
      </div>
    </div>
  )
}
