"use client"

import { useState, useEffect } from "react"
import { AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { getReports, getPeopleByLocation, getNeedCategories } from "@/lib/data"
import { filterReportsByTimeRange } from "@/lib/utils"
import type { Report } from "@/lib/types"

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"]

// Mock data for response time analysis
const MOCK_RESPONSE_TIMES = [
  { name: "Emergency", acknowledgment: 12, resolution: 45 },
  { name: "High", acknowledgment: 25, resolution: 90 },
  { name: "Medium", acknowledgment: 60, resolution: 180 },
  { name: "Low", acknowledgment: 120, resolution: 360 },
]

export function AnalyticsDashboard() {
  const [reports, setReports] = useState<Report[]>([])
  const [filteredReports, setFilteredReports] = useState<Report[]>([])
  const [timeFilter, setTimeFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchReports()
  }, [])

  useEffect(() => {
    if (reports.length) {
      filterReports(timeFilter)
    }
  }, [reports, timeFilter])

  async function fetchReports() {
    setLoading(true)
    try {
      const data = await getReports()
      setReports(data)
    } catch (error) {
      console.error("Failed to fetch reports:", error)
    } finally {
      setLoading(false)
    }
  }

  async function refreshData() {
    setRefreshing(true)
    await fetchReports()
    setRefreshing(false)
  }

  function filterReports(filter: string) {
    let days = 0
    switch (filter) {
      case "24h":
        days = 1
        break
      case "3d":
        days = 3
        break
      case "7d":
        days = 7
        break
      case "all":
      default:
        setFilteredReports(reports)
        return
    }

    setFilteredReports(filterReportsByTimeRange(reports, days))
  }

  // Calculate metrics
  const totalPeople = filteredReports.reduce((sum, report) => sum + report.peopleCount, 0)
  const medicalEmergencies = filteredReports.filter((report) => report.isUrgentMedical).length
  const medicalPercentage = filteredReports.length ? Math.round((medicalEmergencies / filteredReports.length) * 100) : 0

  const peopleByLocation = getPeopleByLocation(filteredReports)
  const needCategories = getNeedCategories(filteredReports)

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <Tabs defaultValue="all" value={timeFilter} onValueChange={setTimeFilter}>
          <TabsList>
            <TabsTrigger value="24h">24h</TabsTrigger>
            <TabsTrigger value="3d">3 days</TabsTrigger>
            <TabsTrigger value="7d">7 days</TabsTrigger>
            <TabsTrigger value="all">All time</TabsTrigger>
          </TabsList>
        </Tabs>
        <Button variant="outline" size="sm" onClick={refreshData} disabled={refreshing}>
          {refreshing ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Refreshing...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Data
            </>
          )}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>People Distribution by Location</CardTitle>
            <CardDescription>Number of people needing assistance by location</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px]">
              {loading ? (
                <div className="flex h-full items-center justify-center">
                  <p className="text-sm text-muted-foreground">Loading data...</p>
                </div>
              ) : peopleByLocation.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={peopleByLocation} layout="vertical" margin={{ left: 100 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="location" tick={{ fontSize: 12 }} width={100} />
                    <Tooltip
                      formatter={(value) => [`${value} people`, "Count"]}
                      labelFormatter={(label) => `Location: ${label}`}
                    />
                    <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <p className="text-sm text-muted-foreground">No data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Common Needs Analysis</CardTitle>
            <CardDescription>Categorized needs from assistance requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px]">
              {loading ? (
                <div className="flex h-full items-center justify-center">
                  <p className="text-sm text-muted-foreground">Loading data...</p>
                </div>
              ) : needCategories.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={needCategories}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {needCategories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [`${value} requests`, name]} labelFormatter={() => ""} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <p className="text-sm text-muted-foreground">No data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Medical Emergency Distribution</CardTitle>
            <CardDescription>Percentage of requests with medical emergencies</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px]">
              {loading ? (
                <div className="flex h-full items-center justify-center">
                  <p className="text-sm text-muted-foreground">Loading data...</p>
                </div>
              ) : filteredReports.length > 0 ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="relative w-48 h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: "Medical", value: medicalEmergencies },
                            { name: "Non-Medical", value: filteredReports.length - medicalEmergencies },
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                        >
                          <Cell fill="#ef4444" />
                          <Cell fill="#3b82f6" />
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-bold">{medicalPercentage}%</span>
                      <span className="text-sm text-muted-foreground">Medical</span>
                    </div>
                  </div>
                  <div className="mt-6 flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-red-500" />
                      <span className="text-sm">Medical ({medicalEmergencies})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-blue-500" />
                      <span className="text-sm">Non-Medical ({filteredReports.length - medicalEmergencies})</span>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-muted-foreground">
                      {medicalPercentage}% of requests require urgent medical attention
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <p className="text-sm text-muted-foreground">No data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resource Allocation Recommendations</CardTitle>
            <CardDescription>Suggested resource distribution based on need density</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] flex flex-col">
              {loading ? (
                <div className="flex h-full items-center justify-center">
                  <p className="text-sm text-muted-foreground">Loading data...</p>
                </div>
              ) : filteredReports.length > 0 ? (
                <div className="space-y-6 pt-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Priority Locations</h3>
                    <div className="space-y-2">
                      {peopleByLocation.slice(0, 3).map((location, index) => (
                        <div key={index} className="flex items-center">
                          <div className="w-full max-w-xs mr-4">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm">{location.location}</span>
                              <span className="text-sm font-medium">{location.count} people</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2.5">
                              <div
                                className="bg-primary h-2.5 rounded-full"
                                style={{ width: `${Math.min(100, (location.count / totalPeople) * 100)}%` }}
                              ></div>
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {Math.round((location.count / totalPeople) * 100)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium mb-2">Resource Recommendations</h3>
                    <ul className="space-y-2">
                      {needCategories.slice(0, 3).map((need, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span>
                            Allocate {Math.round((need.value / filteredReports.length) * 100)}% of{" "}
                            {need.name.toLowerCase()} resources
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-auto pt-4">
                    <div className="rounded-md bg-blue-50 p-4 dark:bg-blue-950">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <AlertCircle className="h-5 w-5 text-blue-400" />
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">Insight</h3>
                          <div className="mt-2 text-sm text-blue-700 dark:text-blue-400">
                            <p>
                              {medicalPercentage > 30
                                ? "High percentage of medical emergencies detected. Consider deploying additional medical teams."
                                : "Focus resources on the top 3 locations which account for the majority of people in need."}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <p className="text-sm text-muted-foreground">No data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Response Time Analysis</CardTitle>
          <CardDescription>Average time to acknowledge and action requests (in minutes)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[250px]">
            {loading ? (
              <div className="flex h-full items-center justify-center">
                <p className="text-sm text-muted-foreground">Loading data...</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={MOCK_RESPONSE_TIMES}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="acknowledgment" name="Time to Acknowledge" fill="#10b981" />
                  <Bar dataKey="resolution" name="Time to Resolution" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            <p>
              Emergency cases are acknowledged within {MOCK_RESPONSE_TIMES[0].acknowledgment} minutes and resolved within{" "}
              {MOCK_RESPONSE_TIMES[0].resolution} minutes on average. Response times increase with decreasing priority levels.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}