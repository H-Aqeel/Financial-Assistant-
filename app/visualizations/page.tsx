"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ChevronLeft, TrendingUp, Search, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

export default function VisualizationsPage() {
  const [selectedSymbol, setSelectedSymbol] = useState("AAPL")
  const [symbols, setSymbols] = useState([])
  const [volumeData, setVolumeData] = useState([])
  const [priceData, setPriceData] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch symbols from API
  useEffect(() => {
    const fetchSymbols = async () => {
      try {
        const response = await fetch("http://localhost:5001/api/symbols")
        if (!response.ok) throw new Error("Failed to fetch symbols")
        const data = await response.json()
        setSymbols(data.map(symbol => ({ value: symbol, label: `${symbol}` })))
      } catch (error) {
        console.error("Error fetching symbols:", error)
        setError("Failed to load symbols")
      }
    }
    fetchSymbols()
  }, [])

  // Fetch stock data from API
  useEffect(() => {
    const fetchStockData = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(`http://localhost:5001/api/stock_data/${selectedSymbol}`)
        if (!response.ok) throw new Error("Failed to fetch stock data")
        const data = await response.json()
        console.log("Fetched stock data:", data) // Debug log

        // Transform API data for charts, ensuring numbers, and reverse for oldest to newest
        const transformedData = data.map(item => ({
          date: new Date(item.date).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit" }),
          open: Number(item.open),
          high: Number(item.high),
          low: Number(item.low),
          close: Number(item.close),
          volume: Number(item.volume),
          price: Number(item.close) // Ensure price is a number
        })).reverse() // Reverse to show oldest to newest on X-axis

        setPriceData(transformedData)
        setVolumeData(transformedData.map(item => ({ date: item.date, volume: Number(item.volume) })))
      } catch (error) {
        console.error("Error fetching stock data:", error)
        setError("Failed to load stock data")
      } finally {
        setLoading(false)
      }
    }
    fetchStockData()
  }, [selectedSymbol])

  const handleSymbolChange = (value) => {
    setSelectedSymbol(value)
  }

  const refreshData = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setIsRefreshing(false)
      setLastUpdated(new Date())
    }, 1000)
  }

  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  }

  const filteredSymbols = symbols.filter(
    (symbol) =>
      symbol.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      symbol.value.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) return <div className="text-center py-10">Loading...</div>
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>
  if (!priceData.length) return <div className="text-center py-10">No data available for {selectedSymbol}</div>

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="bg-green-600 text-white sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-white hover:opacity-90">
            <ChevronLeft className="h-5 w-5" />
            <span>Back to Home</span>
          </Link>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            <span className="font-bold">Stock Data Dashboard</span>
          </div>
          <Button
            size="sm"
            className="bg-green-500 text-white hover:bg-green-600"
            onClick={refreshData}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-green-800 text-center mb-6">Stock Data Dashboard</h1>

          <div className="max-w-md mx-auto mb-8">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <span className="text-gray-700 font-medium">Select Symbol:</span>
                <Select value={selectedSymbol} onValueChange={handleSymbolChange}>
                  <SelectTrigger className="w-[200px] border-green-200">
                    <SelectValue placeholder="Select a stock" />
                  </SelectTrigger>
                  <SelectContent>
                    <div className="py-2 px-3">
                      <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                          placeholder="Search symbols..."
                          className="pl-8 border-green-200"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                    </div>
                    {filteredSymbols.map((symbol) => (
                      <SelectItem key={symbol.value} value={symbol.value}>
                        {symbol.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="text-sm text-gray-500 text-center">
                Last updated: {lastUpdated.toLocaleTimeString()} | {lastUpdated.toLocaleDateString()}
              </div>
            </div>
          </div>

          <Tabs defaultValue="volume" className="w-full">
            <TabsList className="grid grid-cols-3 mb-4 max-w-md mx-auto">
              <TabsTrigger value="volume">Volume</TabsTrigger>
              <TabsTrigger value="price">Price</TabsTrigger>
              <TabsTrigger value="candlestick">OHLC</TabsTrigger>
            </TabsList>

            <TabsContent value="volume">
              <Card className="border-green-100">
                <CardHeader className="pb-2">
                  <CardTitle className="text-green-800 text-center">{selectedSymbol} Volume (Last 30 Days)</CardTitle>
                  <CardDescription className="text-center">Daily trading volume</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={volumeData}>
                        <defs>
                          <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#16a34a" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="date" stroke="#6b7280" />
                        <YAxis
                          stroke="#6b7280"
                          tickFormatter={(value) => {
                            if (value >= 1000000) return `${(value / 1000000).toFixed(0)}M`
                            return value
                          }}
                        />
                        <Tooltip
                          formatter={(value) => [`${formatNumber(value)}`, "Volume"]}
                          labelFormatter={(label) => `Date: ${label}`}
                        />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="volume"
                          stroke="#16a34a"
                          fillOpacity={1}
                          fill="url(#colorVolume)"
                          name={`${selectedSymbol} Volume`}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="price">
              <Card className="borderthemed">
                <CardHeader className="pb-2">
                  <CardTitle className="text-green-800 text-center">{selectedSymbol} Price (Last 30 Days)</CardTitle>
                  <CardDescription className="text-center">Daily closing price</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={priceData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="date" stroke="#6b7280" />
                        <YAxis stroke="#6b7280" domain={["auto", "auto"]} />
                        <Tooltip
                          formatter={(value) => [`$${value.toFixed(2)}`, "Price"]}
                          labelFormatter={(label) => `Date: ${label}`}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="price"
                          stroke="#16a34a"
                          strokeWidth={2}
                          dot={false}
                          name={`${selectedSymbol} Price`}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-green-50 p-3 rounded-lg">
                      <div className="text-sm text-gray-500">Current</div>
                      <div className="text-xl font-bold text-green-800">
                        ${Number(priceData[priceData.length - 1]?.price).toFixed(2)}
                      </div>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <div className="text-sm text-gray-500">Change</div>
                      <div className="text-xl font-bold text-green-600">
                        {((Number(priceData[priceData.length - 1]?.price) / Number(priceData[0]?.price) - 1) * 100).toFixed(2)}%
                      </div>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <div className="text-sm text-gray-500">High</div>
                      <div className="text-xl font-bold text-green-800">
                        ${Math.max(...priceData.map((d) => Number(d.price))).toFixed(2)}
                      </div>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                      <div className="text-sm text-gray-500">Low</div>
                      <div className="text-xl font-bold text-green-800">
                        ${Math.min(...priceData.map((d) => Number(d.price))).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="candlestick">
              <Card className="border-green-100">
                <CardHeader className="pb-2">
                  <CardTitle className="text-green-800 text-center">
                    {selectedSymbol} OHLC Data (Last 30 Days)
                  </CardTitle>
                  <CardDescription className="text-center">Open, High, Low, Close prices</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={priceData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="date" stroke="#6b7280" />
                        <YAxis stroke="#6b7280" domain={["auto", "auto"]} />
                        <Tooltip
                          formatter={(value) => [`$${value.toFixed(2)}`, ""]}
                          labelFormatter={(label) => `Date: ${label}`}
                        />
                        <Legend />
                        <Bar dataKey="high" fill="#16a34a" name="High" />
                        <Bar dataKey="open" fill="#4ade80" name="Open" />
                        <Bar dataKey="close" fill="#86efac" name="Close" />
                        <Bar dataKey="low" fill="#bbf7d0" name="Low" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <footer className="bg-green-600 text-white py-4 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm">
          <p>© 2025 FinancePak. All market data is for informational purposes only.</p>
        </div>
      </footer>
    </div>
  )
}