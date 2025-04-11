"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Send } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useMediaQuery } from "@/hooks/use-media-query"

interface Message {
  text: string
  isUser: boolean
}

const ChatBot = () => {
  const [messages, setMessages] = useState<Message[]>([
    { text: "Hi there! I'm KWON WOOSUB's AI assistant. What would you like to know about me?", isUser: false },
  ])
  const [input, setInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const isMobile = useMediaQuery("(max-width: 768px)")

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
  
    const userMessage = { text: input, isUser: true }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
  
    try {
      const res = await fetch("https://chatbot-server-j7rd.onrender.com/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: input }),
      })
  
      const data = await res.json()
      const responseMessage = { text: data.answer, isUser: false }
      setMessages((prev) => [...prev, responseMessage])
    } catch (error) {
      setMessages((prev) => [...prev, { text: "エラーが発生しました", isUser: false }])
    }
  }
  

  return (
    <div className="w-full mx-auto">
      <div
        ref={chatContainerRef}
        className="bg-gray-900 rounded-lg shadow-xl flex flex-col overflow-hidden border border-gray-700"
        style={{ height: isMobile ? "400px" : "500px" }}
      >
        {/* Chat messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <motion.div
              key={index}
              className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div
                className={`max-w-[85%] rounded-lg px-4 py-2 ${
                  message.isUser ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-200"
                }`}
              >
                {message.text}
              </div>
            </motion.div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat input */}
        <form onSubmit={handleSend} className="p-3 border-t border-gray-700 bg-gray-800">
          <div className="flex space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              className="flex-1 bg-gray-700 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md"
              aria-label="Send message"
              size="sm"
            >
              <Send size={16} />
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ChatBot
