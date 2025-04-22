"use client"

import { useState, useEffect } from "react"
import { useDropzone } from "react-dropzone"
import { AlertCircle, type File, FileText, RefreshCw, Search, Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { getDocuments, uploadDocument, deleteDocument } from "@/lib/data"
import { formatDate } from "@/lib/utils"
import type { Document } from "@/lib/types"

export function ResourcesManager() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState(false)

  const { getRootProps, getInputProps, isDragActive, acceptedFiles, fileRejections } = useDropzone({
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "text/plain": [".txt"],
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
    },
    maxSize: 10485760, // 10MB
    multiple: false,
    disabled: uploading,
  })

  useEffect(() => {
    fetchDocuments()
  }, [])

  useEffect(() => {
    if (acceptedFiles.length > 0) {
      handleUpload(acceptedFiles[0])
    }
  }, [acceptedFiles])

  async function handleDeleteDocument(docId: string) {
    try {
      const success = await deleteDocument(docId);
      if (success) {
        setDocuments((prev) => prev.filter(doc => doc._id !== docId));
      } else {
        // Optionally show an error message
        setUploadError("Failed to delete document");
        setTimeout(() => setUploadError(null), 3000);
      }
    } catch (error) {
      console.error("Failed to delete document:", error);
    }
  }
  

  async function fetchDocuments() {
    setLoading(true)
    try {
      const data = await getDocuments()
      setDocuments(data)
    } catch (error) {
      console.error("Failed to fetch documents:", error)
    } finally {
      setLoading(false)
    }
  }

  async function refreshData() {
    setRefreshing(true)
    await fetchDocuments()
    setRefreshing(false)
  }

  async function handleUpload(file: File) {
    setUploading(true)
    setUploadProgress(0)
    setUploadError(null)
    setUploadSuccess(false)

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 95) {
          clearInterval(progressInterval)
          return 95
        }
        return prev + 5
      })
    }, 100)

    try {
      const result = await uploadDocument(file)
      if (result) {
        setDocuments((prev) => [result, ...prev])
        setUploadSuccess(true)
        setUploadProgress(100)
      } else {
        throw new Error("Upload failed")
      }
    } catch (error) {
      console.error("Error uploading document:", error)
      setUploadError("Failed to upload document. Please try again.")
      setUploadProgress(0)
    } finally {
      clearInterval(progressInterval)
      setUploading(false)

      // Reset success message after 3 seconds
      if (uploadSuccess) {
        setTimeout(() => {
          setUploadSuccess(false)
        }, 3000)
      }
    }
  }

  // Fixed filter to safely handle documents that might not have originalName
  const filteredDocuments = documents.filter((doc) => {
    if (!doc || typeof doc !== 'object') return false;
    const docName = doc.originalName || '';
    return typeof docName === 'string' && docName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="grid gap-6">
      <Tabs defaultValue="upload">
        <TabsList>
          <TabsTrigger value="upload">Upload Documents</TabsTrigger>
          <TabsTrigger value="manage">Manage Documents</TabsTrigger>
        </TabsList>
        <TabsContent value="upload" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload Information Resources</CardTitle>
              <CardDescription>Upload documents to the knowledge base for the phone agent.</CardDescription>
            </CardHeader>
            <CardContent>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                  isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"
                }`}
              >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center gap-4">
                  <Upload className="h-12 w-12 text-muted-foreground" />
                  {isDragActive ? (
                    <p className="text-lg font-medium">Drop the file here</p>
                  ) : (
                    <>
                      <p className="text-lg font-medium">Drag & drop a file here, or click to select</p>
                      <p className="text-sm text-muted-foreground">
                        Supported formats: PDF, DOC, DOCX, TXT, XLS, XLSX (Max 10MB)
                      </p>
                    </>
                  )}
                </div>
              </div>

              {uploading && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Uploading...</span>
                    <span className="text-sm text-muted-foreground">{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}

              {uploadError && (
                <Alert variant="destructive" className="mt-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{uploadError}</AlertDescription>
                </Alert>
              )}

              {uploadSuccess && (
                <Alert className="mt-6 border-green-500 text-green-500">
                  <AlertTitle>Success</AlertTitle>
                  <AlertDescription>Document uploaded successfully!</AlertDescription>
                </Alert>
              )}

              {fileRejections.length > 0 && (
                <Alert variant="destructive" className="mt-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Invalid File</AlertTitle>
                  <AlertDescription>{fileRejections[0].errors[0].message}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="manage" className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex w-full max-w-sm items-center space-x-2">
              <Input
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9"
                // Fix Input component issue - leftIcon is likely not a valid prop
                // Replace with proper icon implementation or remove if not supported
                startAdornment={<Search className="h-4 w-4 opacity-50 mr-2" />}
              />
            </div>
            <Button variant="outline" size="sm" onClick={refreshData} disabled={refreshing}>
              {refreshing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              <span className="ml-2 hidden sm:inline-block">{refreshing ? "Refreshing..." : "Refresh"}</span>
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Information Resources</CardTitle>
              <CardDescription>Manage documents in the knowledge base.</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading documents...</div>
              ) : filteredDocuments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {searchQuery ? "No documents matching your search." : "No documents uploaded yet."}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredDocuments.map((doc) => (
                    <div key={doc._id} className="flex items-center justify-between rounded-lg border p-4">
                      <div className="flex items-center gap-3">
                        <div className="rounded-md bg-primary/10 p-2">
                          <FileText className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{doc.originalName || 'Unnamed document'}</p>
                          <p className="text-sm text-muted-foreground">
                            Uploaded {doc.uploadedAt ? formatDate(doc.uploadedAt) : 'Unknown date'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          Preview
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteDocument(doc._id)}>
                          <X className="h-4 w-4" />
                          <span className="sr-only">Remove</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}