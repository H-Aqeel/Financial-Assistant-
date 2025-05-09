"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { MessageSquare, FileText, Upload, Send, Loader2 } from "lucide-react"

export default function QASection() {
  const [query, setQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [response, setResponse] = useState("")
  const [activeConversation, setActiveConversation] = useState(false)
  const [uploadedDocs, setUploadedDocs] = useState<string[]>([])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      const mockResponses = [
        "Based on the current PSX data, the market shows a positive trend with the KSE-100 index up by 1.24%. The oil and gas sector is performing particularly well today, with OGDC leading the gains at +3.42%.",
        "The recent news about foreign investment increasing by 12% in PSX is likely to have a positive impact on market sentiment. This could lead to further gains in the coming days, especially in the banking and energy sectors.",
        "Looking at the document you uploaded, the quarterly financial report indicates a 15% year-over-year growth in the technology sector. This aligns with the current market trends showing tech stocks gaining momentum.",
        "The market volume has increased by 8% compared to the previous week, indicating stronger investor participation. This is typically a positive sign for market stability.",
      ]

      setResponse(mockResponses[Math.floor(Math.random() * mockResponses.length)])
      setIsLoading(false)
      setActiveConversation(true)
    }, 1500)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const newDocs = Array.from(files).map((file) => file.name)
      setUploadedDocs([...uploadedDocs, ...newDocs])
    }
  }

  const resetConversation = () => {
    setQuery("")
    setResponse("")
    setActiveConversation(false)
    setUploadedDocs([])
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <MessageSquare className="h-6 w-6 text-green-600" />
        <h2 className="text-xl font-bold text-green-800">Ask about PSX data, news, or documents</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {uploadedDocs.length > 0 && (
          <div className="bg-white p-3 rounded-lg border border-green-200">
            <h3 className="text-sm font-medium text-green-800 mb-2">Uploaded Documents:</h3>
            <div className="space-y-2">
              {uploadedDocs.map((doc, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                  <FileText className="h-4 w-4 text-green-600" />
                  <span>{doc}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-4">
          <Textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask about market trends, analyze news, or summarize uploaded documents..."
            className="min-h-[100px] border-green-200 focus:border-green-400 focus:ring-green-400"
          />

          <div className="flex flex-wrap gap-3">
            <Button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white"
              disabled={isLoading || !query.trim()}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Ask Question
                </>
              )}
            </Button>

            <div className="relative">
              <input type="file" id="file-upload" className="sr-only" multiple onChange={handleFileUpload} />
              <label
                htmlFor="file-upload"
                className="flex items-center gap-2 px-4 py-2 bg-white border border-green-200 rounded-md text-green-700 hover:bg-green-50 cursor-pointer"
              >
                <Upload className="h-4 w-4" />
                Upload Document
              </label>
            </div>

            {activeConversation && (
              <Button
                type="button"
                variant="outline"
                className="border-green-200 text-green-700"
                onClick={resetConversation}
              >
                New Conversation
              </Button>
            )}
          </div>
        </div>
      </form>

      {response && (
        <Card className="border-green-200 bg-white">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="bg-green-100 p-2 rounded-full">
                <MessageSquare className="h-5 w-5 text-green-600" />
              </div>
              <div className="space-y-2">
                <h3 className="font-medium text-green-800">Analysis Result</h3>
                <p className="text-gray-700">{response}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
