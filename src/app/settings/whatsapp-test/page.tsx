'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Eye, 
  EyeOff, 
  Copy, 
  Send, 
  AlertTriangle, 
  Check, 
  ChevronRight,
  Smartphone,
  Lock,
  Globe,
  ArrowLeft
} from 'lucide-react'

export const dynamic = 'force-dynamic'

export default function WhatsAppTestPage() {
  // Section 1: Credentials
  const [phoneNumberId, setPhoneNumberId] = useState('')
  const [accessToken, setAccessToken] = useState('')
  const [showToken, setShowToken] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [validationResult, setValidationResult] = useState<any>(null)

  // Section 2: Message Test
  const [toCountryCode, setToCountryCode] = useState('+51')
  const [toPhoneNumber, setToPhoneNumber] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState('hello_world')
  const [isSending, setIsSending] = useState(false)
  const [sendSteps, setSendSteps] = useState<any[]>([])

  const [copied, setCopied] = useState(false)

  const copyWebhookUrl = () => {
    const url = `${window.location.protocol}//${window.location.host}/api/whatsapp/webhook`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleValidate = async () => {
    if (!phoneNumberId || !accessToken) return
    setIsValidating(true)
    setValidationResult(null)
    setSendSteps([])

    try {
      const response = await fetch('/api/whatsapp/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone_number_id: phoneNumberId, access_token: accessToken }),
      })
      const data = await response.json()
      setValidationResult(data)
    } catch (error: any) {
      setValidationResult({ valid: false, error: error.message })
    } finally {
      setIsValidating(false)
    }
  }

  const handleSendMessage = async () => {
    if (!validationResult?.valid || !toPhoneNumber) return
    setIsSending(true)
    setSendSteps([{ status: 'loading', label: 'Submitting to Meta API' }])

    try {
      // Format phone number: remove spaces, dashes, and + symbol
      const cleanNumber = (toCountryCode + toPhoneNumber).replace(/[\s\-\+]/g, '')
      
      const response = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone_number_id: phoneNumberId,
          access_token: accessToken,
          to: cleanNumber,
          type: 'template',
          template: {
            name: selectedTemplate,
            language: { code: 'en_US' }
          }
        }),
      })

      const data = await response.json()

      if (response.ok && data.messages?.[0]?.id) {
        setSendSteps([
          { status: 'success', label: 'Submitted to Meta API' },
          { status: 'success', label: `Message ID: ${data.messages[0].id}` },
          { status: 'info', label: 'Check your phone! If you received the message, integration is working.' }
        ])
      } else {
        setSendSteps([
          { status: 'error', label: `Meta API Error: ${data.error?.message || 'Unknown error'}` }
        ])
      }
    } catch (error: any) {
      setSendSteps([{ status: 'error', label: `Submission failed: ${error.message}` }])
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0B0D13] p-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <Link href="/settings" className="text-primary hover:underline text-sm flex items-center gap-1 mb-4">
              <ArrowLeft className="w-3 h-3" /> Back to Settings
            </Link>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Smartphone className="text-primary" /> WhatsApp Test Panel
            </h1>
            <p className="text-gray-400">Validate credentials and test bi-directional messaging.</p>
          </div>
          <button
            onClick={copyWebhookUrl}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              copied ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
            }`}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Webhook URL Copied!' : 'Copy Webhook URL'}
          </button>
        </div>

        {/* Section 1: Credentials */}
        <section className="bg-[#1A1D2E] border border-gray-800 rounded-3xl p-8 shadow-xl space-y-6">
          <div className="flex items-center gap-3 border-b border-gray-800 pb-4">
            <Lock className="text-primary w-5 h-5" />
            <h2 className="text-xl font-bold text-white">API Credentials Check</h2>
          </div>

          <div className="grid grid-cols-1 gap-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Phone Number ID</label>
              <input
                type="text"
                value={phoneNumberId}
                onChange={(e) => setPhoneNumberId(e.target.value)}
                placeholder="e.g. 1045938472910"
                className="w-full bg-[#0B0D13] border border-gray-800 rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-primary outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Permanent Access Token</label>
              <div className="relative">
                <input
                  type={showToken ? 'text' : 'password'}
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                  placeholder="EAAB..."
                  className="w-full bg-[#0B0D13] border border-gray-800 rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-primary outline-none transition-all pr-12"
                />
                <button
                  onClick={() => setShowToken(!showToken)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                >
                  {showToken ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={handleValidate}
            disabled={isValidating || !phoneNumberId || !accessToken}
            className="w-full bg-primary hover:bg-primary-dark text-white rounded-xl py-4 font-bold text-lg shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isValidating && <Loader2 className="w-5 h-5 animate-spin" />}
            {isValidating ? 'Validating credentials...' : 'Validate Credentials'}
          </button>

          {validationResult && (
            <div className={`p-5 rounded-2xl border flex items-start gap-4 animate-in fade-in slide-in-from-top-2 duration-300 ${
              validationResult.valid ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'
            }`}>
              {validationResult.valid ? (
                <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
              ) : (
                <XCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
              )}
              <div className="space-y-2 flex-1">
                <h3 className={`font-bold ${validationResult.valid ? 'text-green-500' : 'text-red-500'}`}>
                  {validationResult.valid ? 'Credentials Valid' : 'Invalid Credentials'}
                </h3>
                {validationResult.valid ? (
                  <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                    <div>
                      <span className="text-gray-500 text-xs block">Verified Name</span>
                      <span className="text-white font-medium">{validationResult.name}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 text-xs block">Phone Number</span>
                      <span className="text-white font-medium">{validationResult.phone}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 text-xs block">Quality Rating</span>
                      <span className="text-white font-medium capitalize">{validationResult.quality || 'N/A'}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-red-400 text-sm leading-relaxed">
                    {validationResult.error}
                    {validationResult.code && <span className="block font-mono text-xs mt-1 opacity-70">Error Code: {validationResult.code}</span>}
                  </p>
                )}
              </div>
            </div>
          )}
        </section>

        {/* Section 2: Live Message Test */}
        <section className={`bg-[#1A1D2E] border border-gray-800 rounded-3xl p-8 shadow-xl space-y-6 transition-all duration-500 ${!validationResult?.valid ? 'opacity-40 grayscale pointer-events-none scale-[0.98]' : ''}`}>
          <div className="flex items-center gap-3 border-b border-gray-800 pb-4">
            <Send className="text-primary w-5 h-5" />
            <h2 className="text-xl font-bold text-white">Send Test Message</h2>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex gap-3">
            <AlertTriangle className="text-amber-500 w-5 h-5 flex-shrink-0" />
            <p className="text-xs text-amber-200/80 leading-relaxed font-medium">
              This will send a <strong className="text-amber-400">real WhatsApp message</strong> to the destination number. Make sure the number is active and capable of receiving messages.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">From (Meta ID)</label>
              <div className="flex items-center gap-2 bg-[#0B0D13] border border-gray-800 rounded-xl px-4 py-3 text-gray-400 font-mono text-sm">
                <Smartphone className="w-3.5 h-3.5" />
                {phoneNumberId || 'Validate above first'}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">To (Destination Phone)</label>
              <div className="flex gap-2">
                <select
                  value={toCountryCode}
                  onChange={(e) => setToCountryCode(e.target.value)}
                  className="bg-[#0B0D13] border border-gray-800 rounded-xl px-3 py-3 text-white focus:ring-1 focus:ring-primary outline-none transition-all text-sm font-medium appearance-none"
                >
                  <option value="+51">+51 (PE)</option>
                  <option value="+52">+52 (MX)</option>
                  <option value="+55">+55 (BR)</option>
                  <option value="+54">+54 (AR)</option>
                  <option value="+57">+57 (CO)</option>
                  <option value="+1">+1 (US)</option>
                </select>
                <input
                  type="tel"
                  value={toPhoneNumber}
                  onChange={(e) => setToPhoneNumber(e.target.value)}
                  placeholder="999 888 777"
                  className="flex-1 bg-[#0B0D13] border border-gray-800 rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-primary outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Message Template</label>
            <select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              className="w-full bg-[#0B0D13] border border-gray-800 rounded-xl px-4 py-3 text-white focus:ring-1 focus:ring-primary outline-none transition-all"
            >
              <option value="hello_world">hello_world (pre-approved by Meta)</option>
            </select>
            <div className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-3 mt-2">
              <p className="text-xs text-gray-400 leading-relaxed">
                The hello_world template is pre-approved by Meta and works for all test numbers. Once a contact messages you first, you can reply with free text.
              </p>
            </div>
          </div>

          <button
            onClick={handleSendMessage}
            disabled={isSending || !toPhoneNumber || !validationResult?.valid}
            className="w-full bg-primary hover:bg-primary-dark text-white rounded-xl py-4 font-bold text-lg shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            {isSending ? 'Sending message...' : 'Send Test Message'}
          </button>

          {sendSteps.length > 0 && (
            <div className="space-y-4 pt-2">
              {sendSteps.map((step, i) => (
                <div key={i} className={`flex items-start gap-3 animate-in fade-in slide-in-from-left-2 duration-300 delay-${i * 100}`}>
                  <div className={`mt-1 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center border ${
                    step.status === 'success' ? 'bg-green-500/10 border-green-500 text-green-500' :
                    step.status === 'error' ? 'bg-red-500/10 border-red-500 text-red-500' :
                    step.status === 'loading' ? 'bg-primary/10 border-primary text-primary' :
                    'bg-gray-800 border-gray-700 text-gray-500'
                  }`}>
                    {step.status === 'success' ? <Check className="w-3 h-3 stroke-[3]" /> :
                     step.status === 'error' ? <XCircle className="w-3 h-3" /> :
                     step.status === 'loading' ? <Loader2 className="w-3 h-3 animate-spin" /> :
                     <ChevronRight className="w-3 h-3" />}
                  </div>
                  <div>
                    <p className={`text-sm ${
                      step.status === 'error' ? 'text-red-400 font-medium' : 
                      step.status === 'info' ? 'text-gray-500 italic' : 
                      'text-gray-300 font-medium'
                    }`}>
                      {step.label}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
