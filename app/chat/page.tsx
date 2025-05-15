"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Bot, ChevronLeft, Send, User } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { fetchRAGAnswer } from "@/app/api/api"

type Message = {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: string
}

const exampleQuestions = [
"What is the current market capitalization of Apple, and how has it evolved over the past decade?",
  "How has Tesla's stock price been influenced by its inclusion in the S&P 500 and its focus on artificial intelligence?",
  "What are the major revenue sources for Microsoft, and how have they contributed to its stock market valuation?",
  "How has Alphabet (Google) maintained its market value through its dominance in online advertising?",
  "What impact did Meta's rebranding from Facebook and its metaverse investments have on its stock performance?",
]

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content:
        "Hello! I'm your financial assistant. Ask me anything about the stock exchange, market trends, or specific sectors.",
      role: "assistant",
      timestamp: "00:00",
    },
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!input.trim()) return

    // Add user message with current client-side timestamp
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: "user",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsTyping(true)

    // Fetch bot response from RAG
    try {
      const response = await fetchRAGAnswer(input); // Fetch the response object
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.answer, // Extract the 'answer' property
        role: "assistant",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }

      setMessages((prev) => [...prev, botMessage])
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Sorry, I encountered an error while fetching the response.",
        role: "assistant",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const handleExampleClick = (question: string) => {
    setInput(question)
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="bg-green-600 text-white sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center">
          <Link href="/" className="flex items-center gap-2 text-white hover:opacity-90">
            <ChevronLeft className="h-5 w-5" />
            <span>Back to Home</span>
          </Link>
          <div className="mx-auto flex items-center gap-2">
            <Bot className="h-5 w-5" />
            <span className="font-bold">FinancePak Assistant</span>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6 flex flex-col max-w-4xl">
        <div className="flex-1 overflow-y-auto mb-4 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`flex gap-3 max-w-[80%] ${
                  message.role === "user"
                    ? "bg-green-600 text-white rounded-t-lg rounded-bl-lg"
                    : "bg-gray-100 text-gray-800 rounded-t-lg rounded-br-lg"
                } p-4`}
              >
                <div className="flex-shrink-0 mt-1">
                  {message.role === "user" ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
                </div>
                <div>
                  <p>{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-800 rounded-t-lg rounded-br-lg p-4 flex gap-3">
                <Bot className="h-5 w-5" />
                <div className="flex items-center gap-1">
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="mt-4">
          <Card className="border-green-100 mb-4">
            <div className="p-4">
              <h3 className="text-sm font-medium text-green-800 mb-2">Example questions to get started:</h3>
              <div className="flex flex-wrap gap-2">
                {exampleQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleExampleClick(question)}
                    className="text-sm bg-green-50 hover:bg-green-100 text-green-700 px-3 py-1.5 rounded-full transition-colors"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          <form onSubmit={handleSend} className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about stock market trends, sectors, or financial data..."
              className="resize-none border-green-200 focus:border-green-400 focus:ring-green-400"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSend(e)
                }
              }}
            />
            <Button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white self-end h-full"
              disabled={!input.trim() || isTyping}
            >
              <Send className="h-5 w-5" />
              <span className="sr-only">Send message</span>
            </Button>
          </form>
        </div>
      </main>
    </div>
  )
}