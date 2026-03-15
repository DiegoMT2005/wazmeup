'use client'

import { useState, useEffect } from 'react'

export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/client'
import { 
  BarChart3, 
  Send, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  Smartphone,
  Info,
  ExternalLink,
  MessageSquare
} from 'lucide-react'
import Link from 'next/link'

export default function SettingsPage() {
  const [property, setProperty] = useState<any>(null)
  const [isSending, setIsSending] = useState(false)
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null)
  const [reportPreview, setReportPreview] = useState<string>('')

  const supabase = createClient()

  useEffect(() => {
    async function fetchProperty() {
      const { data } = await supabase.from('properties').select('*').limit(1).single()
      if (data) {
        setProperty(data)
        // Generate a mock preview for the UI
        generatePreview(data.name)
      }
    }
    fetchProperty()
  }, [supabase])

  const generatePreview = (name: string) => {
    const today = new Date()
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    const preview = `*WazMeUp Weekly Report*
${name} — Week of ${lastWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}

*Guest Activity*
New contacts: 12
Messages handled: 145
Bot resolved: 92% of conversations
Escalated to staff: 1

*Response Performance*
Avg first response: < 5 seconds (bot)

_Powered by WazMeUp_`
    setReportPreview(preview)
  }

  const handleSendReport = async () => {
    if (!property) return
    setIsSending(true)
    setStatus(null)

    try {
      const response = await fetch('/api/reports/send-weekly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ property_id: property.id }),
      })

      const result = await response.json()

      if (response.ok) {
        setStatus({ type: 'success', message: `Report sent successfully to ${result.processed?.[0]?.recipients || 0} owners.` })
      } else {
        setStatus({ type: 'error', message: result.error || 'Failed to send report.' })
      }
    } catch (error: any) {
      setStatus({ type: 'error', message: error.message })
    } finally {
      setIsSending(false)
    }
  }

  const formatWhatsAppText = (text: string) => {
    return text.split('\n').map((line, i) => {
      // Bold
      let formatted = line.replace(/\*(.*?)\*/g, '<strong class="text-white">$1</strong>')
      // Italic
      formatted = formatted.replace(/_(.*?)_/g, '<em class="text-gray-400">$1</em>')
      return <p key={i} dangerouslySetInnerHTML={{ __html: formatted || '&nbsp;' }} className="min-h-[1.25rem]" />
    })
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-10">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-gray-400">Configure your property and automated communications.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Report Trigger Card */}
        <section className="bg-secondary/10 border border-gray-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center gap-3">
            <BarChart3 className="text-primary w-6 h-6" />
            <div>
              <h2 className="text-xl font-semibold text-white">Owner Weekly Report</h2>
              <p className="text-sm text-gray-400">Send formatted performance summaries to property owners</p>
            </div>
          </div>

          <div className="bg-blue-900/10 border border-blue-800/50 rounded-lg p-4 flex gap-3">
            <Info className="text-blue-400 w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-200 leading-relaxed">
              This report aggregates data from the last 7 days including guest engagement, bot resolution rates, and staff escalations. Reports are sent as WhatsApp messages to all contacts marked as <strong>&apos;owner&apos;</strong>.
            </p>
          </div>

          <div className="pt-4">
            <button
              onClick={handleSendReport}
              disabled={isSending || !property}
              className={`flex items-center justify-center gap-2 w-full px-6 py-4 rounded-xl font-bold text-lg transition-all ${
                isSending ? 'bg-gray-800 cursor-not-allowed' : 'bg-primary hover:bg-primary-dark text-white'
              }`}
            >
              {isSending ? <Loader2 className="animate-spin w-5 h-5" /> : <Send className="w-5 h-5" />}
              {isSending ? 'Sending report...' : 'Send Weekly Report Now'}
            </button>
          </div>

          {status && (
            <div className={`p-4 rounded-lg flex items-center gap-3 border ${
              status.type === 'success' ? 'bg-green-900/20 border-green-800 text-green-400' : 'bg-red-900/20 border-red-800 text-red-400'
            }`}>
              {status.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              <span className="text-sm font-medium">{status.message}</span>
            </div>
          )}
        </section>

        {/* Action Panel */}
        <section className="bg-secondary/10 border border-gray-800 rounded-2xl p-6 space-y-6 flex flex-col justify-center">
          <div className="flex items-center gap-3">
            <MessageSquare className="text-primary w-6 h-6" />
            <div>
              <h2 className="text-xl font-semibold text-white">Diagnostics</h2>
              <p className="text-sm text-gray-400">Test your WhatsApp Business API connection</p>
            </div>
          </div>
          
          <Link
            href="/settings/whatsapp-test"
            className="flex items-center justify-center gap-2 w-full px-6 py-4 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-bold text-lg transition-all border border-gray-700"
          >
            <Smartphone className="w-5 h-5" />
            Test WhatsApp API
          </Link>
          
          <p className="text-[10px] text-gray-500 text-center">
            Validate credentials and send real test messages to verify your setup.
          </p>
        </section>
        {/* WhatsApp Preview Mockup */}
        <section className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-500 uppercase flex items-center gap-2">
            <Smartphone className="w-4 h-4" /> Message Preview
          </h3>
          
          <div className="relative mx-auto w-full max-w-[320px] h-[550px] bg-[#0F1117] border-8 border-gray-800 rounded-[3rem] shadow-2xl overflow-hidden">
            {/* Phone Header */}
            <div className="h-14 bg-gray-900 flex items-center px-6 gap-3 border-b border-gray-800">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">W</div>
              <div className="flex-1">
                <p className="text-xs text-white font-semibold">WazMeUp Assistant</p>
                <p className="text-[9px] text-green-500">online</p>
              </div>
            </div>

            {/* Chat Body */}
            <div className="p-4 h-[calc(100%-120px)] overflow-y-auto bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat">
              <div className="bg-[#1A1D2E] text-white p-3 rounded-xl rounded-tl-none text-[11px] shadow-sm relative">
                <div className="space-y-0.5">
                  {formatWhatsAppText(reportPreview)}
                </div>
                <div className="text-[8px] text-gray-500 text-right mt-1">
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>

            {/* Phone Bottom Bar */}
            <div className="absolute bottom-0 w-full h-14 bg-gray-900 border-t border-gray-800 flex items-center px-4 gap-2">
              <div className="flex-1 h-8 bg-black rounded-full px-4 text-[10px] text-gray-500 flex items-center">Type a message</div>
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <Send className="w-3.5 h-3.5 text-white" />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
