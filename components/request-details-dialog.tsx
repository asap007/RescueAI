"use client"

import { AlertCircle, Phone } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatDate, getStatusColor } from "@/lib/utils"
import type { Report } from "@/lib/types"

interface RequestDetailsDialogProps {
  report: Report
  open: boolean
  onOpenChange: (open: boolean) => void
  onStatusChange: (id: string, status: "Received" | "Acknowledged" | "Actioned") => void
}

export function RequestDetailsDialog({ report, open, onOpenChange, onStatusChange }: RequestDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Assistance Request Details</DialogTitle>
          <DialogDescription>Detailed information about the assistance request.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Location</h3>
            <span>{report.location}</span>
          </div>
          <div className="flex items-center justify-between">
            <h3 className="font-medium">People Count</h3>
            <span>{report.peopleCount}</span>
          </div>
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Status</h3>
            <Badge className={getStatusColor(report.status)}>{report.status}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Medical Emergency</h3>
            <span className="flex items-center">
              {report.isUrgentMedical ? (
                <>
                  <AlertCircle className="mr-1 h-4 w-4 text-red-500" />
                  <span className="text-red-500">Yes</span>
                </>
              ) : (
                "No"
              )}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Timestamp</h3>
            <span>{formatDate(report.timestamp)}</span>
          </div>
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Caller Number</h3>
            <span className="flex items-center">
              <Phone className="mr-1 h-4 w-4" />
              {report.callerNumber}
            </span>
          </div>
          <div>
            <h3 className="mb-2 font-medium">Need Description</h3>
            <p className="rounded-md bg-muted p-3 text-sm">{report.needDescription}</p>
          </div>
          <div>
            <h3 className="mb-2 font-medium">Update Status</h3>
            <Select
              defaultValue={report.status}
              onValueChange={(value) => onStatusChange(report._id, value as "Received" | "Acknowledged" | "Actioned")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Received">Received</SelectItem>
                <SelectItem value="Acknowledged">Acknowledged</SelectItem>
                <SelectItem value="Actioned">Actioned</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
