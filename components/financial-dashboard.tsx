"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { ArrowUpRight, ArrowDownRight, TrendingUp, Newspaper } from "lucide-react"

// Mock data for PSX
const marketData = [
  { date: "May 1", value: 52100, volume: 120 },
  { date: "May 2", value: 52300, volume: 145 },
  { date: "May 3", value: 52250, volume: 132 },
  { date: "May 4", value: 52400, volume: 148 },
  { date: "May 5", value: 52600, volume: 160 },
  { date: "May 6", value: 52750, volume: 175 },
  { date: "May 7", value: 52650, volume: 155 },
  { date: "May 8", value: 52876, volume: 168 },
]

const topGainers = [
  { symbol: "OGDC", name: "Oil & Gas Dev", change: "+3.42%", price: 86.75 },
  { symbol: "PPL", name: "Pakistan Petroleum", change: "+2.87%", price: 74.3 },
  { symbol: "LUCK", name: "Lucky Cement", change: "+2.65%", price: 635.25 },
  { symbol: "MCB", name: "MCB Bank", change: "+2.14%", price: 142.8 },
]

const topLosers = [
  { symbol: "ENGRO", name: "Engro Corporation", change: "-1.24%", price: 278.5 },
  { symbol: "EFERT", name: "Engro Fertilizers", change: "-0.98%", price: 64.75 },
  { symbol: "HBL", name: "Habib Bank", change: "-0.87%", price: 118.3 },
  { symbol: "UBL", name: "United Bank", change: "-0.65%", price: 124.9 },
]

const recentNews = [
  { title: "SBP maintains policy rate at 15%", source: "Dawn News", time: "2 hours ago" },
  { title: "Foreign investment in PSX increases by 12%", source: "Business Recorder", time: "5 hours ago" },
  { title: "Oil prices surge amid global supply concerns", source: "The News", time: "8 hours ago" },
  { title: "Tech sector shows promising growth in Q2", source: "Express Tribune", time: "1 day ago" },
]

export default function FinancialDashboard() {
  const [activeTab, setActiveTab] = useState("market")

  return (
    <div className="grid gap-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-green-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-green-800 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              KSE-100 Index
            </CardTitle>
            <CardDescription>Current market performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <div className="text-3xl font-bold text-green-800">52,876.39</div>
              <div className="text-green-600 font-medium flex items-center">
                <ArrowUpRight className="h-4 w-4 mr-1" />
                +1.24%
              </div>
            </div>
            <div className="h-[200px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={marketData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                  <YAxis domain={["dataMin - 200", "dataMax + 200"]} stroke="#6b7280" fontSize={12} />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#16a34a" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-green-800">Market Volume</CardTitle>
            <CardDescription>Trading activity (in millions)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={marketData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="volume" fill="#16a34a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-green-800 flex items-center gap-2">
              <Newspaper className="h-5 w-5" />
              Market News
            </CardTitle>
            <CardDescription>Latest financial updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentNews.map((news, index) => (
                <div key={index} className="border-b border-green-100 pb-2 last:border-0">
                  <h3 className="font-medium text-green-800">{news.title}</h3>
                  <div className="flex justify-between text-sm text-gray-500 mt-1">
                    <span>{news.source}</span>
                    <span>{news.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-green-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-green-800 flex items-center gap-2">
              <ArrowUpRight className="h-5 w-5 text-green-600" />
              Top Gainers
            </CardTitle>
            <CardDescription>Best performing stocks today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {topGainers.map((stock, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-2 border-b border-green-50 last:border-0"
                >
                  <div>
                    <div className="font-medium">{stock.symbol}</div>
                    <div className="text-sm text-gray-500">{stock.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{stock.price}</div>
                    <div className="text-green-600 text-sm">{stock.change}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-green-800 flex items-center gap-2">
              <ArrowDownRight className="h-5 w-5 text-red-500" />
              Top Losers
            </CardTitle>
            <CardDescription>Worst performing stocks today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {topLosers.map((stock, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-2 border-b border-green-50 last:border-0"
                >
                  <div>
                    <div className="font-medium">{stock.symbol}</div>
                    <div className="text-sm text-gray-500">{stock.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{stock.price}</div>
                    <div className="text-red-500 text-sm">{stock.change}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
