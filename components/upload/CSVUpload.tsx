'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Upload, FileText, CheckCircle, AlertCircle, Download } from 'lucide-react'

interface CSVUploadProps {
  onUploadComplete?: (data: any) => void
}

export function CSVUpload({ onUploadComplete }: CSVUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    setUploading(true)
    setError(null)
    setProgress(0)

    try {
      // Marc's approach: Parse CSV client-side first for immediate feedback
      const text = await file.text()
      const lines = text.split('\n')
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
      
      // Validate CSV format
      const requiredColumns = ['subject', 'description', 'status']
      const hasRequiredColumns = requiredColumns.some(col => 
        headers.some(header => header.includes(col))
      )
      
      if (!hasRequiredColumns) {
        throw new Error('CSV must contain columns like: subject, description, status, created_at')
      }

      // Simulate upload progress
      for (let i = 0; i <= 100; i += 10) {
        setProgress(i)
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      // Parse tickets
      const tickets = lines.slice(1)
        .filter(line => line.trim())
        .map((line, index) => {
          const values = line.split(',').map(v => v.trim().replace(/"/g, ''))
          return {
            id: `ticket_${index + 1}`,
            subject: values[0] || `Ticket ${index + 1}`,
            description: values[1] || 'No description',
            status: values[2] || 'open',
            created_at: values[3] || new Date().toISOString(),
            category: null,
            sentiment: null
          }
        })

      // Marc's pattern: Basic analysis without AI
      const analysis = analyzeTicketsBasic(tickets)
      
      setResults({
        tickets,
        analysis,
        uploadedAt: new Date().toISOString()
      })
      
      onUploadComplete?.(tickets)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }, [onUploadComplete])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv']
    },
    maxFiles: 1
  })

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-blue-400" />
            Upload Your Support Tickets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${isDragActive 
                ? 'border-blue-400 bg-blue-400/10' 
                : 'border-slate-600 hover:border-slate-500'
              }
            `}
          >
            <input {...getInputProps()} />
            <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            {isDragActive ? (
              <p className="text-blue-400">Drop your CSV file here...</p>
            ) : (
              <div>
                <p className="text-white mb-2">Drag & drop your CSV file here, or click to browse</p>
                <p className="text-sm text-slate-400">
                  CSV should contain columns: subject, description, status, created_at
                </p>
              </div>
            )}
          </div>

          {uploading && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">Processing tickets...</span>
                <span className="text-sm text-slate-400">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Sample CSV Download */}
      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-white">Need a sample CSV?</h3>
              <p className="text-sm text-slate-400">Download our template to see the expected format</p>
            </div>
            <Button
              variant="outline"
              onClick={() => downloadSampleCSV()}
              className="border-slate-600 text-slate-300"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Sample
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {results && (
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              Upload Complete!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{results.tickets.length}</div>
                <div className="text-sm text-slate-400">Tickets Processed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{results.analysis.categories.length}</div>
                <div className="text-sm text-slate-400">Categories Found</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">${results.analysis.estimatedMonthlyCost}</div>
                <div className="text-sm text-slate-400">Est. Monthly Cost</div>
              </div>
            </div>
            
            <Button 
              onClick={() => window.location.href = '/dashboard'}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              View Full Analysis
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Marc's basic analysis without AI
function analyzeTicketsBasic(tickets: any[]) {
  const categories = new Set<string>()
  let totalCost = 0

  tickets.forEach(ticket => {
    // Basic categorization by keywords
    const text = `${ticket.subject} ${ticket.description}`.toLowerCase()
    
    if (text.includes('password') || text.includes('login') || text.includes('access')) {
      categories.add('Authentication')
    } else if (text.includes('billing') || text.includes('payment') || text.includes('invoice')) {
      categories.add('Billing')
    } else if (text.includes('bug') || text.includes('error') || text.includes('broken')) {
      categories.add('Bug Report')
    } else if (text.includes('feature') || text.includes('request') || text.includes('enhancement')) {
      categories.add('Feature Request')
    } else {
      categories.add('General Support')
    }
    
    // Estimate cost: $15 average per ticket
    totalCost += 15
  })

  return {
    categories: Array.from(categories),
    estimatedMonthlyCost: totalCost,
    ticketCount: tickets.length,
    avgCostPerTicket: 15
  }
}

function downloadSampleCSV() {
  const sampleData = [
    ['subject', 'description', 'status', 'created_at'],
    ['Password Reset Issue', 'User cannot reset their password', 'open', '2024-01-15T10:30:00Z'],
    ['Billing Question', 'Customer asking about invoice charges', 'closed', '2024-01-15T11:00:00Z'],
    ['Feature Request', 'Request for dark mode in the app', 'open', '2024-01-15T12:00:00Z'],
    ['Bug Report', 'App crashes on mobile device', 'in_progress', '2024-01-15T13:00:00Z']
  ]
  
  const csvContent = sampleData.map(row => row.join(',')).join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'supportiq_sample_tickets.csv'
  link.click()
  window.URL.revokeObjectURL(url)
}