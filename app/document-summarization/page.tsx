"use client"

import type React from "react"
import { useState, useRef } from "react"
import {
  ChevronLeft,
  FileText,
  Upload,
  FileUp,
  FilePlus,
  Loader2,
  FileCheck,
  AlertTriangle,
  Download,
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

type DocumentType = {
  id: string
  name: string
  type: string
  size: string
  uploadedAt: Date
  status: "processing" | "completed" | "error"
  summary?: string
  keyInsights?: string[]
  errorMessage?: string
}

export default function DocumentSummarizationPage() {
  const [documents, setDocuments] = useState<DocumentType[]>([])
  const [activeDocument, setActiveDocument] = useState<DocumentType | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [questionInput, setQuestionInput] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    const file = files[0]
    const formData = new FormData()
    formData.append("file", file)

    const newDocument: DocumentType = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
      name: file.name,
      type: file.name.split(".").pop()?.toUpperCase() || "Unknown",
      size: formatFileSize(file.size),
      uploadedAt: new Date(),
      status: "processing",
    }

    setDocuments((prev) => [newDocument, ...prev])
    setActiveDocument(newDocument)

    try {
      const response = await fetch("http://127.0.0.1:5006/upload_and_summarize", {
        method: "POST",
        body: formData,
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to summarize document")
      }

      const updatedDocument: DocumentType = {
        ...newDocument,
        status: "completed",
        summary: data.summary,
        keyInsights: extractKeyInsights(data.summary),
      }

      setDocuments((prev) =>
        prev.map((doc) => (doc.id === newDocument.id ? updatedDocument : doc)),
      )
      setActiveDocument(updatedDocument)
    } catch (error) {
      const errorDocument: descripcionDocumentType = {
        ...newDocument,
        status: "error",
        errorMessage: error instanceof Error ? error.message : "Unknown error",
      }
      setDocuments((prev) =>
        prev.map((doc) => (doc.id === newDocument.id ? errorDocument : doc)),
      )
      setActiveDocument(errorDocument)
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!questionInput.trim() || !activeDocument) return

    setIsUploading(true)
    try {
      const response = await fetch("http://127.0.0.1:5006/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: questionInput, document_id: activeDocument.id }),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to process question")
      }

      const updatedSummary = `${
        activeDocument.summary || ""
      }\n\n**Q: ${questionInput}**\nA: ${data.answer}`

      const updatedDocument: DocumentType = {
        ...activeDocument,
        summary: updatedSummary,
      }

      setDocuments((prev) =>
        prev.map((doc) => (doc.id === activeDocument.id ? updatedDocument : doc)),
      )
      setActiveDocument(updatedDocument)
      setQuestionInput("")
    } catch (error) {
      const errorDocument: DocumentType = {
        ...activeDocument,
        status: "error",
        errorMessage: error instanceof Error ? error.message : "Unknown error",
      }
      setDocuments((prev) =>
        prev.map((doc) => (doc.id === activeDocument.id ? errorDocument : doc)),
      )
      setActiveDocument(errorDocument)
    } finally {
      setIsUploading(false)
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i]
  }

  const extractKeyInsights = (summary: string): string[] => {
    // Exclude Q/A pairs by filtering out lines starting with "Q:" or "A:"
    const lines = summary.split("\n").filter(line => !line.startsWith("**Q:") && !line.startsWith("A:"))
    return lines
      .join(" ")
      .split(/[.!?]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 10)
      .slice(0, 6)
  }

  const handleDocumentClick = (document: DocumentType) => {
    setActiveDocument(document)
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
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
            <FileText className="h-5 w-5" />
            <span className="font-bold">Document Summarization</span>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-green-800">Financial Document Analysis</h1>
          <p className="text-gray-600">Upload financial documents to get AI-powered summaries and key insights</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <Card className="border-green-100">
              <CardHeader className="pb-2">
                <CardTitle className="text-green-800 flex items-center gap-2">
                  <FileUp className="h-5 w-5" />
                  Document Upload
                </CardTitle>
                <CardDescription>Upload financial reports, statements, or analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div
                    className="border-2 border-dashed border-green-200 rounded-lg p-6 text-center hover:bg-green-50 transition-colors cursor-pointer"
                    onClick={triggerFileInput}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt"
                      onChange={handleFileUpload}
                    />
                    <Upload className="h-10 w-10 text-green-500 mx-auto mb-2" />
                    <p className="text-green-800 font-medium">Drag and drop files here or click to browse</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Supports PDF, Word, Excel, CSV, and text files up to 10MB
                    </p>
                  </div>

                  <Button
                    onClick={triggerFileInput}
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <FilePlus className="mr-2 h-4 w-4" />
                        Upload Documents
                      </>
                    )}
                  </Button>

                  <Separator className="my-4" />

                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-gray-700">Your Documents</h3>
                    {documents.length === 0 ? (
                      <p className="text-sm text-gray-500 italic">No documents uploaded yet</p>
                    ) : (
                      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                        {documents.map((doc) => (
                          <div
                            key={doc.id}
                            className={`p-3 rounded-lg border ${
                              activeDocument?.id === doc.id
                                ? "border-green-300 bg-green-50"
                                : "border-gray-200 hover:border-green-200"
                            } cursor-pointer transition-colors`}
                            onClick={() => handleDocumentClick(doc)}
                          >
                            <div className="flex items-start gap-3">
                              <div className="text-green-600 mt-1">
                                {doc.status === "processing" ? (
                                  <Loader2 className="h-5 w-5 animate-spin" />
                                ) : doc.status === "error" ? (
                                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                                ) : (
                                  <FileCheck className="h-5 w-5" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-green-800 truncate">{doc.name}</p>
                                <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                  <span>{doc.type}</span>
                                  <span>•</span>
                                  <span>{doc.size}</span>
                                </div>

                                <div className="mt-1">
                                  {doc.status === "processing" ? (
                                    <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">
                                      Processing
                                    </Badge>
                                  ) : doc.status === "error" ? (
                                    <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50">
                                      Error
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                                      Completed
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2">
            <Card className="border-green-100 h-full">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-green-800">
                      {activeDocument ? activeDocument.name : "No Document Selected"}
                    </CardTitle>
                    {activeDocument && (
                      <CardDescription>
                        Uploaded on {activeDocument.uploadedAt.toLocaleDateString()}
                      </CardDescription>
                    )}
                  </div>
                  {activeDocument?.status === "completed" && (
                    <Button variant="outline" size="sm" className="text-green-600 border-green-200">
                      <Download className="h-4 w-4 mr-1" /> Export
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {!activeDocument ? (
                  <div className="text-center text-gray-500 py-12">
                    <FileText className="h-12 w-12 text-green-200 mx-auto mb-4" />
                    <p>Please select a document from the left to view its summary and ask questions.</p>
                  </div>
                ) : activeDocument.status === "processing" ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="h-10 w-10 text-green-500 animate-spin mb-4" />
                    <p className="text-green-800 font-medium">Analyzing document...</p>
                    <p className="text-sm text-gray-500 mt-1">This may take a few moments</p>
                  </div>
                ) : activeDocument.status === "error" ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <AlertTriangle className="h-10 w-10 text-amber-500 mb-4" />
                    <p className="text-amber-800 font-medium">Error processing document</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {activeDocument.errorMessage || "Please try uploading again"}
                    </p>
                  </div>
                ) : (
                  <Tabs defaultValue="summary">
                    <TabsList className="grid grid-cols-2 mb-4">
                      <TabsTrigger value="summary">Document Summary</TabsTrigger>
                      <TabsTrigger value="insights">Key Insights</TabsTrigger>
                    </TabsList>
                    <TabsContent value="summary" className="space-y-4">
                      <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                        <h3 className="text-lg font-medium text-green-800 mb-2">Executive Summary</h3>
                        <p className="text-gray-700 whitespace-pre-wrap">{activeDocument.summary}</p>
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-lg font-medium text-green-800">Ask Follow-up Questions</h3>
                        <form onSubmit={handleAskQuestion} className="space-y-2">
                          <Textarea
                            value={questionInput}
                            onChange={(e) => setQuestionInput(e.target.value)}
                            placeholder="Ask a specific question about this document..."
                            className="border-green-200 focus:border-green-400 focus:ring-green-400"
                          />
                          <Button
                            type="submit"
                            className="bg-green-600 hover:bg-green-700"
                            disabled={!questionInput.trim() || isUploading}
                          >
                            {isUploading ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              "Ask Question"
                            )}
                          </Button>
                        </form>
                      </div>
                    </TabsContent>
                    <TabsContent value="insights">
                      <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                        <h3 className="text-lg font-medium text-green-800 mb-4">Key Financial Insights</h3>
                        <div className="grid gap-3">
                          {activeDocument.keyInsights?.map((insight, index) => (
                            <div
                              key={index}
                              className="flex items-start gap-3 bg-white p-3 rounded-lg border border-green-100"
                            >
                              <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                <span className="text-green-600 text-sm">✓</span>
                              </div>
                              <p className="text-gray-700">{insight}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <footer className="bg-green-600 text-white py-4 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm">
          <p>© 2025 FinancePak. All document analysis is for informational purposes only.</p>
        </div>
      </footer>
    </div>
  )
}