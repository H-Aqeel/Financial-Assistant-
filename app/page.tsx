import type React from "react"
import { ArrowRight, FileText, LineChart, MessageSquare, TrendingUp, BarChart3 } from "lucide-react"

import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-green-600 text-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6" />
            <span className="font-bold text-xl">FinPilot</span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-green-600 to-green-500 text-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid gap-12 items-center max-w-3xl mx-auto text-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                Smart Financial Assistant for the High TECH Comapnies
              </h1>
              <p className="text-xl opacity-90">
                Empower your investment decisions with AI-powered analysis of data, financial documents, and market
                news.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100">
                  <Link href="/chat" className="flex items-center">
                    Chat Now <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-white text-green-600 bg-white hover:bg-gray-100">
                  <Link href="/document-summarization" className="flex items-center">
                    <FileText className="mr-2 h-5 w-5" /> Document Summarization
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-white text-green-600 bg-white hover:bg-gray-100">
                  <Link href="/visualizations" className="flex items-center">
                    <BarChart3 className="mr-2 h-5 w-5" /> See Visualizations
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-green-800">Powerful Financial Intelligence</h2>
            <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
              Our platform combines multiple data sources with advanced AI to deliver actionable insights for
              investors.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<BarChart3 className="h-10 w-10 text-green-600" />}
              title="Data Analysis"
              description="Access and analyze daily Pakistan Stock Exchange data with intuitive visualizations."
            />
            <FeatureCard
              icon={<LineChart className="h-10 w-10 text-green-600" />}
              title="Market Trends"
              description="Visualize market trends and patterns to identify investment opportunities."
            />
            <FeatureCard
              icon={<FileText className="h-10 w-10 text-green-600" />}
              title="Document Summarization"
              description="Upload financial documents for instant AI-powered analysis and key insights."
            />
            <FeatureCard
              icon={<MessageSquare className="h-10 w-10 text-green-600" />}
              title="Conversational Queries"
              description="Ask questions in plain language and get intelligent financial answers."
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-green-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-green-800">How It Works</h2>
            <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
              Our platform makes complex financial analysis simple and accessible.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-green-600 font-bold text-xl">1</span>
              </div>
              <h3 className="text-xl font-bold text-green-800 mb-2">Access Market Data</h3>
              <p className="text-gray-600">
                Get real-time data, market trends, and financial news in one unified dashboard.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-green-600 font-bold text-xl">2</span>
              </div>
              <h3 className="text-xl font-bold text-green-800 mb-2">Ask Questions</h3>
              <p className="text-gray-600">
                Use natural language to query market data, upload documents, or analyze specific stocks.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-green-600 font-bold text-xl">3</span>
              </div>
              <h3 className="text-xl font-bold text-green-800 mb-2">Get Insights</h3>
              <p className="text-gray-600">
                Receive AI-powered analysis, visualizations, and actionable recommendations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <div className="bg-green-50 p-6 rounded-lg border border-green-100 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <MessageSquare className="h-6 w-6 text-green-600" />
                  <h3 className="text-xl font-bold text-green-800">Ask about Companies data or documents</h3>
                </div>
                <div className="bg-white p-4 rounded-lg border border-green-100 mb-4">
                  <p className="text-gray-700">
                    "How has the banking sector performed over the last quarter compared to the energy sector?"
                  </p>
                </div>
                <div className="bg-green-100 p-4 rounded-lg">
                  <p className="text-gray-800">
                    "Based on the data, the banking sector has shown a 7.2% growth over the last quarter,
                    outperforming the energy sector which grew by 4.5%. Key banking stocks like MCB and HBL have driven
                    this growth with strong quarterly results and increased dividend payouts."
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-6 order-1 md:order-2">
              <h2 className="text-3xl font-bold text-green-800">Simple Stock Exchange</h2>
              <p className="text-gray-600">
                Ask questions in plain language and get detailed, accurate responses based on the latest market data,
                news, and your own financial documents.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                    <span className="text-green-600 text-sm">✓</span>
                  </div>
                  <span className="text-gray-700">Analyze sector performance and trends</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                    <span className="text-green-600 text-sm">✓</span>
                  </div>
                  <span className="text-gray-700">Compare stocks and financial metrics</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                    <span className="text-green-600 text-sm">✓</span>
                  </div>
                  <span className="text-gray-700">Summarize financial documents and reports</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-green-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Transform Your Investment Decisions?</h2>
          <p className="text-xl opacity-90 max-w-2xl mx-auto mb-8">
            Join investors who are making smarter, data-driven decisions with our AI-powered financial
            assistant.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100">
              <Link href="/chat">Get Started Now</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white text-green-600 bg-white hover:bg-gray-100">
              <Link href="/document-summarization">
                <FileText className="mr-2 h-5 w-5" /> Analyze Documents
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white text-green-600 bg-white hover:bg-gray-100">
              <Link href="/visualizations">
                <BarChart3 className="mr-2 h-5 w-5" /> View Market Data
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-green-800 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <TrendingUp className="h-6 w-6" />
              <span className="font-bold text-xl">FinancePak</span>
            </div>
            <div className="text-sm opacity-80">
              © 2025 FinancePak. All market data is for informational purposes only.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-green-800 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}
