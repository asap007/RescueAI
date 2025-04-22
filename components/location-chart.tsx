"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { getLocationDistribution } from "@/lib/data"
import type { Report } from "@/lib/types"

interface LocationChartProps {
  reports: Report[]
}

export function LocationChart({ reports }: LocationChartProps) {
  const data = getLocationDistribution(reports)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Location Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} layout="vertical" margin={{ left: 70 }}>
                <XAxis type="number" />
                <YAxis type="category" dataKey="location" tick={{ fontSize: 12 }} width={70} />
                <Tooltip
                  formatter={(value) => [`${value} requests`, "Count"]}
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
  )
}
