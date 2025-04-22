import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Report } from "@/lib/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  const d = new Date(date)
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
  }).format(d)
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date()
  const then = new Date(date)
  const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return `${diffInSeconds} seconds ago`
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`
  }

  const diffInDays = Math.floor(diffInHours / 24)
  return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "Received":
      return "text-red-500 bg-red-100 dark:bg-red-950 dark:text-red-400"
    case "Acknowledged":
      return "text-yellow-500 bg-yellow-100 dark:bg-yellow-950 dark:text-yellow-400"
    case "Actioned":
      return "text-green-500 bg-green-100 dark:bg-green-950 dark:text-green-400"
    default:
      return "text-gray-500 bg-gray-100 dark:bg-gray-800 dark:text-gray-400"
  }
}

export function calculateMetrics(reports: Report[]) {
  const totalRequests = reports.length
  const totalPeople = reports.reduce((sum, report) => sum + report.peopleCount, 0)
  const medicalEmergencies = reports.filter((report) => report.isUrgentMedical).length

  const statusCounts = reports.reduce(
    (acc, report) => {
      acc[report.status] = (acc[report.status] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const locationCounts = reports.reduce(
    (acc, report) => {
      acc[report.location] = (acc[report.location] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  return {
    totalRequests,
    totalPeople,
    medicalEmergencies,
    statusCounts,
    locationCounts,
  }
}

export function groupReportsByTime(reports: Report[], interval: "hour" | "day" = "hour") {
  const timeMap = new Map<string, number>()

  reports.forEach((report) => {
    const date = new Date(report.timestamp)
    let timeKey: string

    if (interval === "hour") {
      timeKey = new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours()).toISOString()
    } else {
      timeKey = new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString()
    }

    timeMap.set(timeKey, (timeMap.get(timeKey) || 0) + 1)
  })

  return Array.from(timeMap.entries())
    .map(([time, count]) => ({
      time:
        interval === "hour"
          ? new Date(time).toLocaleTimeString([], { hour: "2-digit", hour12: true })
          : new Date(time).toLocaleDateString(),
      count,
    }))
    .sort((a, b) => a.time.localeCompare(b.time))
}

export function filterReportsByTimeRange(reports: Report[], days: number) {
  const now = new Date()
  const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)

  return reports.filter((report) => new Date(report.timestamp) >= cutoff)
}
