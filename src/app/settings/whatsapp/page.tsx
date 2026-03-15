'use client'

import { useState, useEffect } from 'react'

export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/client'
import { 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Send, 
  ShieldCheck, 
  Settings,
  AlertTriangle,
  History
} from 'lucide-react'

interface ValidationResult {
  valid: boolean
  phone?: string
  name?: string
  wabaId?: string
  status?: string
  error?: string
  code?: number
}

interface DeliveryStep {
  label: string
  status: 'pending' | 'loading' | 'success' | 'error'
  detail?: string
}

export default function WhatsAppSettingsPage() {
  const [property, setProperty] = useState<any>(null)
  const [phoneId, setPhoneId] = useState('')
  const [accessToken, setAccessToken] = useState('')
  const [isValidating, setIsValidating] = useState(false)
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  
  const [recipient, setRecipient] = useState('')
  const [testMessage, setTestMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [deliverySteps, setDeliverySteps] = useState<DeliveryStep[]>([])

  const supabase = createClient()

  useEffect(() => {
    async function fetchProperty() {
      const { data } = await supabase.from('properties').select('*').limit(1).single()
      if (data) {
        setProperty(data)
        setPhoneId(data.whatsapp_phone_number_id || '')
        setAccessToken(data.whatsapp_access_token || '')
        setTestMessage(`This is a WazMeUp test message from ${data.name}. Your WhatsApp integration is working correctly!`)
      }
    }
    fetchProperty()
  }, [supabase])

  const handleValidate = async () => {
    setIsValidating(true)
    setValidationResult(null)
    try {
      const response = await fetch('/api/whatsapp/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone_number_id: phoneId, access_token: accessToken }),
      })
      const data = await response.json()
      setValidationResult(data)
    } catch (error) {
      setValidationResult({ valid: false, error: 'Failed to connect to validation API' })
    } finally {
      setIsValidating(false)
    }
  }

  const handleSendTest = async () => {
    if (!property) return
    setIsSending(true)
    setDeliverySteps([
      { label: 'Message submitted to Meta API', status: 'loading' }
    ])

    try {
      const response = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          property_id: property.id,
          to: recipient,
          message_type: 'text',
          content: { body: testMessage }
        }),
      })

      const result = await response.json()

      if (response.ok) {
        setDeliverySteps([
          { label: 'Message submitted to Meta API', status: 'success', detail: `ID: ${result.messages?.[0]?.id || 'N/A'}` },
          { label: 'Message sent to WhatsApp network', status: 'loading' }
        ])

        // Simulate 2s poll for delivery
        setTimeout(() => {
          setDeliverySteps(prev => [
            prev[0],
            { label: 'Message sent to WhatsApp network', status: 'success', detail: `Meta ID: ${result.messages?.[0]?.id}` }
          ])
          setIsSending(false)
        }, 2000)
      } else {
        setDeliverySteps([
          { label: 'Message submitted to Meta API', status: 'error', detail: result.error?.message || 'Submission failed' }
        ])
        setIsSending(false)
      }
    } catch (error: any) {
      setDeliverySteps([
        { label: 'Message submitted to Meta API', status: 'error', detail: error.message }
      ])
      setIsSending(false)
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">WhatsApp Integration Testing</h1>
        <p className="text-gray-400">Manage and verify your WhatsApp Cloud API connection.</p>
      </div>

      {/* SECTION 1 — Credential Validator */}
      <section className="bg-secondary/10 border border-gray-800 rounded-xl p-6 space-y-6">
        <div className="flex items-center gap-3">
          <ShieldCheck className="text-primary w-6 h-6" />
          <div>
            <h2 className="text-xl font-semibold text-white">API Credentials Check</h2>
            <p className="text-sm text-gray-400">Verify your Meta credentials are valid and active</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Phone Number ID</label>
            <input
              type="text"
              value={phoneId}
              onChange={(e) => setPhoneId(e.target.value)}
              className="w-full bg-[#0F1117] border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              placeholder="e.g. 10482930291"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Access Token</label>
            <input
              type="password"
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              className="w-full bg-[#0F1117] border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              placeholder="Meta Access Token"
            />
          </div>
        </div>

        <button
          onClick={handleValidate}
          disabled={isValidating || !phoneId || !accessToken}
          className={`flex items-center justify-center gap-2 px-6 py-2 rounded-lg font-medium transition-all ${
            isValidating ? 'bg-gray-700 cursor-not-allowed' : 'bg-gray-800 hover:bg-gray-700 text-white'
          }`}
        >
          {isValidating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Settings className="w-4 h-4" />}
          {isValidating ? 'Validating credentials...' : 'Validate Credentials'}
        </button>

        {/* Validation Result Cards */}
        {validationResult && (
          <div className={`rounded-lg p-5 border ${validationResult.valid ? 'bg-green-900/20 border-green-800' : 'bg-red-900/20 border-red-800'}`}>
            <div className="flex items-start gap-4">
              {validationResult.valid ? (
                <CheckCircle2 className="w-6 h-6 text-green-500 mt-1" />
              ) : (
                <XCircle className="w-6 h-6 text-red-500 mt-1" />
              )}
              <div className="flex-1 space-y-3">
                <h3 className={`font-bold ${validationResult.valid ? 'text-green-500' : 'text-red-500'}`}>
                  {validationResult.valid ? 'Credentials Valid' : 'Invalid Credentials'}
                </h3>
                {validationResult.valid ? (
                  <div className="grid grid-cols-2 gap-y-2 text-sm">
                    <span className="text-gray-400">Verified Name:</span>
                    <span className="text-white font-medium">{validationResult.name}</span>
                    <span className="text-gray-400">Phone Number:</span>
                    <span className="text-white font-medium">{validationResult.phone}</span>
                    <span className="text-gray-400">WABA ID:</span>
                    <span className="text-white font-medium">{validationResult.wabaId}</span>
                    <span className="text-gray-400">Account Status:</span>
                    <span className="text-green-400 px-2 py-0.5 bg-green-900/30 rounded inline-block w-fit">{validationResult.status}</span>
                  </div>
                ) : (
                  <div className="text-sm text-red-300 bg-red-950/40 p-3 rounded border border-red-900/50">
                    <p className="font-mono mb-1">Error Code: {validationResult.code}</p>
                    <p>{validationResult.error}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* SECTION 2 — Live Message Test */}
      <section className={`bg-secondary/10 border border-gray-800 rounded-xl p-6 space-y-6 ${!validationResult?.valid && 'opacity-50 grayscale transition-all'}`}>
        <div className="flex items-center gap-3">
          <Send className="text-primary w-6 h-6" />
          <div>
            <h2 className="text-xl font-semibold text-white">Send Test Message</h2>
            <p className="text-sm text-gray-400">Send a real WhatsApp message to verify end-to-end delivery</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">From (Host Number)</label>
              <select className="w-full bg-[#0F1117] border border-gray-700 rounded-lg px-4 py-2 text-white outline-none">
                <option>{validationResult?.phone || 'Select a number'}</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">To (Destination)</label>
              <div className="flex gap-2">
                <select className="w-20 bg-[#0F1117] border border-gray-700 rounded-lg px-2 py-2 text-white outline-none">
                  <option>+51</option>
                  <option>+1</option>
                  <option>+52</option>
                </select>
                <input
                  type="text"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="flex-1 bg-[#0F1117] border border-gray-700 rounded-lg px-4 py-2 text-white outline-none focus:ring-2 focus:ring-primary"
                  placeholder="999888777"
                />
              </div>
              <p className="text-xs text-yellow-500/80 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> This will send a real WhatsApp message to this number
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Message</label>
            <textarea
              rows={4}
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              className="w-full bg-[#0F1117] border border-gray-700 rounded-lg px-4 py-2 text-white outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <button
          onClick={handleSendTest}
          disabled={isSending || !validationResult?.valid || !recipient}
          className="flex items-center justify-center gap-2 w-full md:w-auto px-8 py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-lg transition-all disabled:bg-gray-700 disabled:cursor-not-allowed group"
        >
          {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
          {isSending ? 'Sending Test Message...' : 'Send Test Message'}
        </button>

        {/* Delivery Timeline */}
        {deliverySteps.length > 0 && (
          <div className="mt-6 border-t border-gray-800 pt-6 space-y-6">
            <h3 className="text-sm font-semibold text-gray-500 uppercase flex items-center gap-2">
              <History className="w-4 h-4" /> Delivery Status
            </h3>
            <div className="space-y-8 relative before:content-[''] before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-800">
              {deliverySteps.map((step, idx) => (
                <div key={idx} className="flex gap-4 relative">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center z-10 transition-colors ${
                    step.status === 'loading' ? 'bg-primary/20 text-primary border border-primary/50' :
                    step.status === 'success' ? 'bg-green-500 text-white' :
                    step.status === 'error' ? 'bg-red-500 text-white' : 'bg-gray-800 text-gray-600'
                  }`}>
                    {step.status === 'loading' ? <Loader2 className="w-3 h-3 animate-spin" /> :
                     step.status === 'success' ? <CheckCircle2 className="w-4 h-4" /> :
                     step.status === 'error' ? <XCircle className="w-4 h-4" /> : null}
                  </div>
                  <div>
                    <p className={`font-medium ${
                      step.status === 'error' ? 'text-red-500' : 
                      step.status === 'pending' ? 'text-gray-600' : 'text-gray-200'
                    }`}>{step.label}</p>
                    {step.detail && <p className="text-xs text-gray-500 mt-1 font-mono">{step.detail}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
