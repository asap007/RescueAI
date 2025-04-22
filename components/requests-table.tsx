"use client"

import { useState, useEffect } from "react"
import { AlertCircle, ArrowUpDown, Download, RefreshCw, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { RequestDetailsDialog } from "@/components/request-details-dialog"
import { getReports, updateReportStatus } from "@/lib/data"
import { formatRelativeTime, getStatusColor } from "@/lib/utils"
import type { Report } from "@/lib/types"

export function RequestsTable() {
  const [reports, setReports] = useState<Report[]>([])
  const [filteredReports, setFilteredReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Report
    direction: "asc" | "desc"
  }>({
    key: "timestamp",
    direction: "desc",
  })

  useEffect(() => {
    fetchReports()
  }, [])

  useEffect(() => {
    filterReports()
  }, [reports, searchQuery, statusFilter])

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

  function filterReports() {
    let filtered = [...reports]

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((report) => report.status === statusFilter)
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (report) =>
          report.location.toLowerCase().includes(query) ||
          report.needDescription.toLowerCase().includes(query) ||
          report.callerNumber.includes(query),
      )
    }

    // Sort reports
    filtered.sort((a, b) => {
      const aValue = a[sortConfig.key]
      const bValue = b[sortConfig.key]

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortConfig.direction === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
      }

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue
      }

      if (aValue instanceof Date && bValue instanceof Date) {
        return sortConfig.direction === "asc"
          ? aValue.getTime() - bValue.getTime()
          : bValue.getTime() - aValue.getTime()
      }

      return 0
    })

    setFilteredReports(filtered)
  }

  function handleSort(key: keyof Report) {
    setSortConfig((prevConfig) => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === "asc" ? "desc" : "asc",
    }))
  }

  function exportToCsv() {
    const headers = [
      "ID",
      "Location",
      "People Count",
      "Need Description",
      "Status",
      "Medical Emergency",
      "Timestamp",
      "Caller Number",
    ]

    const csvRows = [
      headers.join(","),
      ...filteredReports.map((report) =>
        [
          report._id,
          `"${report.location.replace(/"/g, '""')}"`,
          report.peopleCount,
          `"${report.needDescription.replace(/"/g, '""')}"`,
          report.status,
          report.isUrgentMedical,
          report.timestamp,
          report.callerNumber,
        ].join(","),
      ),
    ]

    const csvContent = csvRows.join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", "assistance_requests.csv")
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  function handleLocalStatusUpdate(id: string, newStatus: "Received" | "Acknowledged" | "Actioned") {
    // Use the imported function from @/lib/data explicitly
    import('@/lib/data').then(module => {
      return module.updateReportStatus(id, newStatus);
    }).then(success => {
      if (success) {
        // Then update local state only if API call was successful
        setReports((prevReports) =>
          prevReports.map((report) => 
            report._id === id ? { ...report, status: newStatus } : report
          ),
        )
      }
    })
  }

  function updateLocalReportStatus(id: string, newStatus: "Received" | "Acknowledged" | "Actioned") {
    setReports((prevReports) =>
      prevReports.map((report) => (report._id === id ? { ...report, status: newStatus } : report)),
    )
  }

  const handleStatusChange = async (id: string, status: "Received" | "Acknowledged" | "Actioned") => {
    // Use the imported function from @/lib/data explicitly
    const success = await import('@/lib/data').then(module => module.updateReportStatus(id, status));
    
    if (success) {
      // Update local state to reflect the change
      setReports(reports.map(report => 
        report._id === id ? { ...report, status } : report
      ))
      
      // If the dialog is showing a report whose status was just changed, update it
      if (selectedReport && selectedReport._id === id) {
        setSelectedReport({ ...selectedReport, status })
      }
    }
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-full max-w-sm items-center space-x-2">
          <Input
            placeholder="Search by location, need, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9"
            leftIcon={<Search className="h-4 w-4 opacity-50" />}
          />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9 w-[130px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Received">Received</SelectItem>
              <SelectItem value="Acknowledged">Acknowledged</SelectItem>
              <SelectItem value="Actioned">Actioned</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={refreshData} disabled={refreshing}>
            {refreshing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            <span className="ml-2 hidden sm:inline-block">{refreshing ? "Refreshing..." : "Refresh"}</span>
          </Button>
          <Button variant="outline" size="sm" onClick={exportToCsv}>
            <Download className="h-4 w-4" />
            <span className="ml-2 hidden sm:inline-block">Export</span>
          </Button>
        </div>
      </div>

      <Card>
        <div className="relative w-full overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px]">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("location")}
                    className="flex items-center gap-1 px-0 font-medium"
                  >
                    Location
                    <ArrowUpDown className="h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead className="w-[100px]">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("peopleCount")}
                    className="flex items-center gap-1 px-0 font-medium"
                  >
                    People
                    <ArrowUpDown className="h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead className="hidden md:table-cell">Need Description</TableHead>
                <TableHead className="w-[120px]">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("status")}
                    className="flex items-center gap-1 px-0 font-medium"
                  >
                    Status
                    <ArrowUpDown className="h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead className="w-[100px]">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort("timestamp")}
                    className="flex items-center gap-1 px-0 font-medium"
                  >
                    Time
                    <ArrowUpDown className="h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead className="w-[100px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    Loading data...
                  </TableCell>
                </TableRow>
              ) : filteredReports.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No requests found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredReports.map((report) => (
                  <TableRow
                    key={report._id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setSelectedReport(report)}
                  >
                    <TableCell className="font-medium">
                      {report.location}
                      {report.isUrgentMedical && (
                        <div className="mt-1 flex items-center">
                          <AlertCircle className="mr-1 h-3 w-3 text-red-500" />
                          <span className="text-xs text-red-500">Medical Emergency</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{report.peopleCount}</TableCell>
                    <TableCell className="hidden max-w-[300px] truncate md:table-cell">
                      {report.needDescription}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(report.status)}>{report.status}</Badge>
                    </TableCell>
                    <TableCell>{formatRelativeTime(report.timestamp)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="sm">
                            Update
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation()
                              handleLocalStatusUpdate(report._id, "Received")
                            }}
                          >
                            Mark as Received
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation()
                              handleLocalStatusUpdate(report._id, "Acknowledged")
                            }}
                          >
                            Mark as Acknowledged
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation()
                              handleLocalStatusUpdate(report._id, "Actioned")
                            }}
                          >
                            Mark as Actioned
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {selectedReport && (
        <RequestDetailsDialog
          report={selectedReport}
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  )
}
