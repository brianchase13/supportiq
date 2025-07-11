import { CSVUpload } from '@/components/upload/CSVUpload'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function UploadPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/dashboard" 
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          
          <h1 className="text-3xl font-bold text-white mb-2">
            Upload Your Support Tickets
          </h1>
          <p className="text-slate-400">
            Get instant insights on your support costs and deflection opportunities
          </p>
        </div>

        {/* Upload Component */}
        <CSVUpload />

        {/* Instructions */}
        <div className="mt-12 bg-slate-900 border border-slate-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">How to get your support data:</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-white">From Intercom:</h3>
              <p className="text-sm text-slate-400">
                Go to Settings → Data → Export data → Export conversations as CSV
              </p>
            </div>
            <div>
              <h3 className="font-medium text-white">From Zendesk:</h3>
              <p className="text-sm text-slate-400">
                Admin Center → Reporting → Explore → Create report → Export as CSV
              </p>
            </div>
            <div>
              <h3 className="font-medium text-white">From Freshdesk:</h3>
              <p className="text-sm text-slate-400">
                Reports → Ticket reports → Export → Download CSV
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}