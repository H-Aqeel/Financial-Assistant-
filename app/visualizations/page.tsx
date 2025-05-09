"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronLeft, RefreshCw, TrendingUp, BarChart3, PieChart, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

// Mock data for visualizations
const kse100Data = [
  { date: "May 1", value: 52100 },
  { date: "May 2", value: 52300 },
  { date: "May 3", value: 52250 },
  { date: "May 4", value: 52400 },
  { date: "May 5", value: 52600 },
  { date: "May 6", value: 52750 },
  { date: "May 7", value: 52650 },
  { date: "May 8", value: 52876 },
]

const sectorPerformanceData = [
  { name: "Banking", value: 7.2 },
  { name: "Energy", value: 4.5 },
  { name: "Cement", value: 3.8 },
  { name: "Textile", value: 2.9 },
  { name: "Technology", value: 6.5 },
  { name: "Fertilizer", value: 5.1 },
]

const marketCapData = [
  { name: "Banking", value: 35 },
  { name: "Energy", value: 25 },
  { name: "Cement", value: 15 },
  { name: "Textile", value: 10 },
  { name: "Technology", value: 8 },
  { name: "Others", value: 7 },
]

const tradingVolumeData = [
  { date: "May 1", volume: 120 },
  { date: "May 2", volume: 145 },
  { date: "May 3", volume: 132 },
  { date: "May 4", volume: 148 },
  { date: "May 5", volume: 160 },
  { date: "May 6", volume: 175 },
  { date: "May 7", volume: 155 },
  { date: "May 8", volume: 168 },
]

const topStocksData = [
  { name: "OGDC", value: 3.42 },
  { name: "PPL", value: 2.87 },
  { name: "LUCK", value: 2.65 },
  { name: "MCB", value: 2.14 },
  { name: "UBL", value: 1.98 },
]

const COLORS = ["#16a34a", "#22c55e", "#4ade80", "#86efac", "#bbf7d0", "#dcfce7"]

export default function VisualizationsPage() {
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [isRefreshing, setIsRefreshing] = useState(false)

  const refreshData = () => {
    setIsRefreshing(true)

    // Simulate data refresh
    setTimeout(() => {
      setLastUpdated(new Date())
      setIsRefreshing(false)
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="bg-green-600 text-white sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-white hover:opacity-90">
            <ChevronLeft className="h-5 w-5" />
            <span>Back to Home</span>
          </Link>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            <span className="font-bold">Market Visualizations</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="text-white border-white hover:bg-green-700"
            onClick={refreshData}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh Data
          </Button>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-green-800">Real-Time Market Visualizations</h1>
            <p className="text-gray-600">Interactive charts and graphs showing the latest PSX market data</p>
          </div>
          <div className="text-sm text-gray-500">
            Last updated: {lastUpdated.toLocaleTimeString()} | {lastUpdated.toLocaleDateString()}
          </div>
        </div>

        <div className="grid gap-6">
          <Card className="border-green-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-green-800 flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                KSE-100 Index Performance
              </CardTitle>
              <CardDescription>Daily index values for the past week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={kse100Data}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#16a34a" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" stroke="#6b7280" />
                    <YAxis domain={[52000, 53000]} stroke="#6b7280" />
                    <Tooltip />
                    <Area type="monotone" dataKey="value" stroke="#16a34a" fillOpacity={1} fill="url(#colorValue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-500">Current</div>
                  <div className="text-xl font-bold text-green-800">52,876</div>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-500">Change</div>
                  <div className="text-xl font-bold text-green-600">+1.24%</div>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-500">High</div>
                  <div className="text-xl font-bold text-green-800">52,950</div>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="text-sm text-gray-500">Low</div>
                  <div className="text-xl font-bold text-green-800">52,100</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-green-100">
              <CardHeader className="pb-2">
                <CardTitle className="text-green-800 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Sector Performance
                </CardTitle>
                <CardDescription>Quarterly growth by sector (%)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sectorPerformanceData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis type="number" stroke="#6b7280" />
                      <YAxis dataKey="name" type="category" stroke="#6b7280" width={80} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#16a34a" radius={[0, 4, 4, 0]}>
                        {sectorPerformanceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-100">
              <CardHeader className="pb-2">
                <CardTitle className="text-green-800 flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Market Capitalization
                </CardTitle>
                <CardDescription>Distribution by sector (%)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={marketCapData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {marketCapData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="volume" className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="volume">Trading Volume</TabsTrigger>
              <TabsTrigger value="gainers">Top Gainers</TabsTrigger>
              <TabsTrigger value="comparison">Sector Comparison</TabsTrigger>
            </TabsList>
            <TabsContent value="volume">
              <Card className="border-green-100">
                <CardHeader className="pb-2">
                  <CardTitle className="text-green-800 flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Trading Volume
                  </CardTitle>
                  <CardDescription>Daily trading volume (in millions)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={tradingVolumeData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="date" stroke="#6b7280" />
                        <YAxis stroke="#6b7280" />
                        <Tooltip />
                        <Bar dataKey="volume" fill="#16a34a" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="gainers">
              <Card className="border-green-100">
                <CardHeader className="pb-2">
                  <CardTitle className="text-green-800 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Top Performing Stocks
                  </CardTitle>
                  <CardDescription>Daily percentage gain (%)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={topStocksData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="name" stroke="#6b7280" />
                        <YAxis stroke="#6b7280" />
                        <Tooltip />
                        <Bar dataKey="value" fill="#16a34a" radius={[4, 4, 0, 0]}>
                          {topStocksData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="comparison">
              <Card className="border-green-100">
                <CardHeader className="pb-2">
                  <CardTitle className="text-green-800 flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Banking vs Energy Sector
                  </CardTitle>
                  <CardDescription>Quarterly performance comparison</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                          dataKey="date"
                          stroke="#6b7280"
                          data={[{ date: "Q1" }, { date: "Q2" }, { date: "Q3" }, { date: "Q4" }]}
                        />
                        <YAxis stroke="#6b7280" />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="banking"
                          stroke="#16a34a"
                          strokeWidth={2}
                          data={[
                            { date: "Q1", banking: 5.2 },
                            { date: "Q2", banking: 6.1 },
                            { date: "Q3", banking: 7.2 },
                            { date: "Q4", banking: 7.8 },
                          ]}
                          name="Banking"
                        />
                        <Line
                          type="monotone"
                          dataKey="energy"
                          stroke="#0ea5e9"
                          strokeWidth={2}
                          data={[
                            { date: "Q1", energy: 3.8 },
                            { date: "Q2", energy: 4.2 },
                            { date: "Q3", energy: 4.5 },
                            { date: "Q4", energy: 5.1 },
                          ]}
                          name="Energy"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <footer className="bg-green-600 text-white py-4">
        <div className="container mx-auto px-4 text-center text-sm">
          <p>© 2025 FinancePak. All market data is for informational purposes only.</p>
        </div>
      </footer>
    </div>
  )
}
