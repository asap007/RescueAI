"use client"

import { useEffect, useState } from "react"
import { Activity, AlertCircle, RefreshCw, Users } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { MetricCard } from "@/components/metric-card"
import { StatusChart } from "@/components/status-chart"
import { LocationChart } from "@/components/location-chart"
import { TimelineChart } from "@/components/timeline-chart"
import { getReports } from "@/lib/data"
import { calculateMetrics, filterReportsByTimeRange } from "@/lib/utils"
import type { Report } from "@/lib/types"

export function DashboardOverview() {
  const [reports, setReports] = useState<Report[]>([])
  const [filteredReports, setFilteredReports] = useState<Report[]>([])
  const [timeFilter, setTimeFilter] = useState("24h")
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
    let days = 1
    switch (filter) {
      case "3d":
        days = 3
        break
      case "7d":
        days = 7
        break
      case "all":
        setFilteredReports(reports)
        return
      default:
        days = 1
    }

    setFilteredReports(filterReportsByTimeRange(reports, days))
  }

  const metrics = calculateMetrics(filteredReports)

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <Tabs defaultValue="24h" value={timeFilter} onValueChange={setTimeFilter}>
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Active Requests"
          value={metrics.totalRequests}
          description="Total assistance requests"
          icon={<Activity className="h-4 w-4" />}
        />
        <MetricCard
          title="People Needing Assistance"
          value={metrics.totalPeople}
          description="Total people reported"
          icon={<Users className="h-4 w-4" />}
        />
        <MetricCard
          title="Medical Emergencies"
          value={metrics.medicalEmergencies}
          description="Urgent medical cases"
          icon={<AlertCircle className="h-4 w-4" />}
          className="border-red-200 dark:border-red-900"
        />
        <MetricCard
          title="Actioned Requests"
          value={metrics.statusCounts["Actioned"] || 0}
          description={`${Math.round(((metrics.statusCounts["Actioned"] || 0) / metrics.totalRequests) * 100) || 0}% completion rate`}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <TimelineChart reports={filteredReports} />
        </Card>
        <Card className="col-span-3">
          <StatusChart reports={filteredReports} />
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <LocationChart reports={filteredReports} />
        </Card>
        <Card className="flex items-center justify-center p-6">
          <div className="text-center">
            <h3 className="text-lg font-medium">Geographic Distribution</h3>
            <p className="text-sm text-muted-foreground mt-2">Map visualization showing concentration of requests</p>
            <div className="mt-6 h-[200px] w-full bg-muted rounded-md flex items-center justify-center">
              <p className="text-sm text-muted-foreground">Map visualization will be displayed here</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
