import type React from "react"
export interface Report {
  _id: string
  location: string
  peopleCount: number
  needDescription: string
  status: "Received" | "Acknowledged" | "Actioned"
  isUrgentMedical: boolean
  timestamp: string
  callSid: string
  callerNumber: string
}

export interface Document {
  _id: string
  originalName: string
  uploadedAt: string
  mimeType: string
}

export interface MetricCardProps {
  title: string
  value: string | number
  description?: string
  icon?: React.ReactNode
  trend?: {
    value: number
    isPositive: boolean
  }
  className?: string
}

export interface ChartData {
  name: string
  value: number
}

export interface TimelineData {
  time: string
  count: number
}

export interface LocationData {
  location: string
  count: number
}

export interface StatusData {
  status: string
  count: number
}
