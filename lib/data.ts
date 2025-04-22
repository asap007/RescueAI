import type { Report, Document, ChartData, TimelineData, LocationData, StatusData } from "@/lib/types"

export async function getReports(): Promise<Report[]> {
  try {
    const response = await fetch("https://disastermanagement-7gso.onrender.com/api/reports", {
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch reports: ${response.status}`)
    }

    return response.json()
  } catch (error) {
    console.error("Error fetching reports:", error)
    return []
  }
}

export async function getDocuments(): Promise<Document[]> {
  try {
    const response = await fetch("https://disastermanagement-7gso.onrender.com/api/documents", {
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch documents: ${response.status}`)
    }

    return response.json()
  } catch (error) {
    console.error("Error fetching documents:", error)
    return []
  }
}

export async function uploadDocument(file: File): Promise<Document | null> {
  try {
    const formData = new FormData()
    formData.append("documentFile", file)

    const response = await fetch("https://disastermanagement-7gso.onrender.com/api/documents", {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`Failed to upload document: ${response.status}`)
    }

    return response.json()
  } catch (error) {
    console.error("Error uploading document:", error)
    return null
  }
}

export async function deleteDocument(documentId: string): Promise<boolean> {
  try {
    const response = await fetch(`https://disastermanagement-7gso.onrender.com/api/documents/${documentId}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      throw new Error(`Failed to delete document: ${response.status}`)
    }

    return true
  } catch (error) {
    console.error("Error deleting document:", error)
    return false
  }
}

export function getStatusDistribution(reports: Report[]): StatusData[] {
  const statusCounts: Record<string, number> = {
    Received: 0,
    Acknowledged: 0,
    Actioned: 0,
  }

  reports.forEach((report) => {
    statusCounts[report.status] = (statusCounts[report.status] || 0) + 1
  })

  return Object.entries(statusCounts).map(([status, count]) => ({
    status,
    count,
  }))
}

export function getLocationDistribution(reports: Report[]): LocationData[] {
  const locationCounts: Record<string, number> = {}

  reports.forEach((report) => {
    locationCounts[report.location] = (locationCounts[report.location] || 0) + 1
  })

  return Object.entries(locationCounts)
    .map(([location, count]) => ({
      location,
      count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10) // Top 10 locations
}

export function getPeopleByLocation(reports: Report[]): LocationData[] {
  const peopleCounts: Record<string, number> = {}

  reports.forEach((report) => {
    peopleCounts[report.location] = (peopleCounts[report.location] || 0) + report.peopleCount
  })

  return Object.entries(peopleCounts)
    .map(([location, count]) => ({
      location,
      count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10) // Top 10 locations
}

export function getRequestTimeline(reports: Report[]): TimelineData[] {
  const timeMap = new Map<string, number>()

  reports.forEach((report) => {
    const date = new Date(report.timestamp)
    const hour = date.getHours()
    const timeKey = `${hour}:00`

    timeMap.set(timeKey, (timeMap.get(timeKey) || 0) + 1)
  })

  return Array.from(timeMap.entries())
    .map(([time, count]) => ({
      time,
      count,
    }))
    .sort((a, b) => {
      const hourA = Number.parseInt(a.time.split(":")[0])
      const hourB = Number.parseInt(b.time.split(":")[0])
      return hourA - hourB
    })
}

export function getNeedCategories(reports: Report[]): ChartData[] {
  const needKeywords: Record<string, string[]> = {
    Food: ["food", "hungry", "meal", "eat"],
    Water: ["water", "thirsty", "drink"],
    Medical: ["medical", "medicine", "doctor", "injury", "hurt", "pain", "wound"],
    Shelter: ["shelter", "home", "house", "roof", "sleep"],
    Evacuation: ["evacuation", "evacuate", "escape", "leave", "flee"],
    Other: [],
  }

  const categoryCounts: Record<string, number> = {
    Food: 0,
    Water: 0,
    Medical: 0,
    Shelter: 0,
    Evacuation: 0,
    Other: 0,
  }

  reports.forEach((report) => {
    const description = report.needDescription.toLowerCase()
    let matched = false

    for (const [category, keywords] of Object.entries(needKeywords)) {
      if (keywords.some((keyword) => description.includes(keyword))) {
        categoryCounts[category]++
        matched = true
        break
      }
    }

    if (!matched) {
      categoryCounts["Other"]++
    }
  })

  return Object.entries(categoryCounts)
    .map(([name, value]) => ({
      name,
      value,
    }))
    .filter((item) => item.value > 0)
}


export async function updateReportStatus(reportId: string, status: "Received" | "Acknowledged" | "Actioned"): Promise<boolean> {
  try {
    const response = await fetch(`https://disastermanagement-7gso.onrender.com/api/reports/${reportId}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    })

    if (!response.ok) {
      throw new Error(`Failed to update report status: ${response.status}`)
    }

    return true
  } catch (error) {
    console.error("Error updating report status:", error)
    return false
  }
}