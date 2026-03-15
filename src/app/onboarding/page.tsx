'use client'

import { useState, useEffect } from 'react'

export const dynamic = 'force-dynamic'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { v4 as uuidv4 } from 'uuid'

const LATAM_COUNTRIES = [
  'Mexico', 'Colombia', 'Argentina', 'Peru', 'Venezuela', 'Chile', 'Guatemala',
  'Ecuador', 'Bolivia', 'Cuba', 'Dominican Republic', 'Honduras', 'Paraguay',
  'El Salvador', 'Nicaragua', 'Costa Rica', 'Panama', 'Uruguay', 'Brazil'
]

const PROPERTY_TYPES = ['Condo Hotel', 'Boutique Hotel', 'Vacation Rental', 'Resort']

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [testStatus, setTestStatus] = useState<'idle' | 'loading' | 'success' | 'failed'>('idle')
  const [testError, setTestError] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    type: PROPERTY_TYPES[0],
    country: LATAM_COUNTRIES[0],
    whatsapp_phone_number_id: '',
    whatsapp_access_token: '',
    whatsapp_webhook_verify_token: uuidv4(),
    brand_color: '#1D9E75',
    logo_url: '',
  })

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleTestConnection = async () => {
    setTestStatus('loading')
    setTestError('')
    try {
      const res = await fetch('/api/whatsapp/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumberId: formData.whatsapp_phone_number_id,
          accessToken: formData.whatsapp_access_token,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setTestStatus('success')
      } else {
        setTestStatus('failed')
        setTestError(data.error || 'Connection failed')
      }
    } catch (err) {
      setTestStatus('failed')
      setTestError('Network error')
    }
  }

  const handleLaunch = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.from('properties').insert([
        {
          name: formData.name,
          whatsapp_phone_number_id: formData.whatsapp_phone_number_id,
          whatsapp_access_token: formData.whatsapp_access_token,
          whatsapp_webhook_verify_token: formData.whatsapp_webhook_verify_token,
          brand_color: formData.brand_color,
          logo_url: formData.logo_url,
          plan: 'starter',
          is_active: true,
        },
      ])

      if (error) throw error
      router.push('/dashboard')
    } catch (error) {
      console.error('Error launching property:', error)
      alert('Failed to save property. Please check your Supabase connection.')
    } finally {
      setLoading(false)
    }
  }

  const nextStep = () => setStep((s) => Math.min(s + 1, 4))
  const prevStep = () => setStep((s) => Math.max(s - 1, 1))

  return (
    <div className="min-h-screen bg-[#0F1117] text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-[#1A1D2E] rounded-xl shadow-2xl p-8 border border-gray-800">
        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-8">
          <div className="text-sm font-medium text-gray-400">Step {step} of 4</div>
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`h-2 w-12 rounded-full transition-colors ${
                  i <= step ? 'bg-primary' : 'bg-gray-700'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step Content */}
        {step === 1 && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold">Property Details</h1>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Property Name</label>
                <input
                  type="text"
                  className="w-full bg-[#0F1117] border border-gray-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  value={formData.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder="e.g. Grand Riviera Resort"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Property Type</label>
                <select
                  className="w-full bg-[#0F1117] border border-gray-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
                  value={formData.type}
                  onChange={(e) => updateField('type', e.target.value)}
                >
                  {PROPERTY_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Country</label>
                <select
                  className="w-full bg-[#0F1117] border border-gray-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
                  value={formData.country}
                  onChange={(e) => updateField('country', e.target.value)}
                >
                  {LATAM_COUNTRIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                  <option disabled>---</option>
                  <option value="USA">United States</option>
                  <option value="Canada">Canada</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold">WhatsApp Connection</h1>
            <div className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-4 text-sm text-blue-200">
              Set your Webhook URL in Meta to: <br />
              <code className="bg-black/40 px-2 py-1 rounded mt-2 inline-block">
                https://wazmeup.vercel.app/api/whatsapp/webhook
              </code>
            </div>
            <div className="space-y-4">
              <div className="group relative">
                <label className="block text-sm font-medium text-gray-400 mb-1 flex items-center gap-2">
                  Meta Phone Number ID
                  <span className="cursor-help text-xs text-primary underline">info</span>
                  <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block bg-gray-800 text-white text-xs p-2 rounded shadow-lg w-64 z-10">
                    Found in Meta Business Manager → WhatsApp → Phone Numbers
                  </div>
                </label>
                <input
                  type="text"
                  className="w-full bg-[#0F1117] border border-gray-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  value={formData.whatsapp_phone_number_id}
                  onChange={(e) => updateField('whatsapp_phone_number_id', e.target.value)}
                  placeholder="e.g. 1029384756"
                />
              </div>
              <div className="group relative">
                <label className="block text-sm font-medium text-gray-400 mb-1 flex items-center gap-2">
                  WhatsApp Access Token
                  <span className="cursor-help text-xs text-primary underline">info</span>
                  <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block bg-gray-800 text-white text-xs p-2 rounded shadow-lg w-64 z-10">
                    Your permanent or temporary Meta access token
                  </div>
                </label>
                <input
                  type="password"
                  className="w-full bg-[#0F1117] border border-gray-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  value={formData.whatsapp_access_token}
                  onChange={(e) => updateField('whatsapp_access_token', e.target.value)}
                  placeholder="EAAB..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Webhook Verify Token</label>
                <input
                  type="text"
                  className="w-full bg-[#0F1117] border border-gray-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  value={formData.whatsapp_webhook_verify_token}
                  onChange={(e) => updateField('whatsapp_webhook_verify_token', e.target.value)}
                />
              </div>
              <button
                onClick={handleTestConnection}
                disabled={testStatus === 'loading'}
                className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${
                  testStatus === 'success'
                    ? 'bg-green-600 text-white'
                    : testStatus === 'failed'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-700 hover:bg-gray-600 text-white'
                }`}
              >
                {testStatus === 'loading' && <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />}
                {testStatus === 'success' && <span>✓ Connected</span>}
                {testStatus === 'failed' && <span>✗ Test Failed</span>}
                {testStatus === 'idle' && <span>Test Connection</span>}
              </button>
              {testError && <p className="text-red-500 text-sm mt-1">{testError}</p>}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold">Brand Setup</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Brand Color</label>
                  <div className="flex gap-4 items-center">
                    <input
                      type="color"
                      className="h-12 w-24 bg-transparent border-none cursor-pointer"
                      value={formData.brand_color}
                      onChange={(e) => updateField('brand_color', e.target.value)}
                    />
                    <span className="font-mono text-sm">{formData.brand_color.toUpperCase()}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Logo URL (Optional)</label>
                  <input
                    type="text"
                    className="w-full bg-[#0F1117] border border-gray-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary"
                    value={formData.logo_url}
                    onChange={(e) => updateField('logo_url', e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              </div>
              
              {/* Phone Mockup Preview */}
              <div className="flex flex-col items-center">
                <p className="text-sm font-medium text-gray-400 mb-4">Preview</p>
                <div className="w-48 h-96 border-4 border-gray-800 rounded-[2.5rem] bg-gray-950 relative overflow-hidden shadow-xl">
                  {/* WhatsApp Header Mockup */}
                  <div 
                    className="h-12 w-full flex items-center px-4 gap-2 transition-colors duration-300"
                    style={{ backgroundColor: formData.brand_color }}
                  >
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
                      {formData.logo_url ? (
                        <Image 
                          src={formData.logo_url} 
                          alt="Logo" 
                          className="w-full h-full object-cover" 
                          width={100} 
                          height={100}
                          unoptimized
                        />
                      ) : (
                        <div className="w-4 h-4 bg-white/30 rounded-full" />
                      )}
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <div className="h-2 w-20 bg-white/40 rounded" />
                      <div className="h-1.5 w-12 bg-white/20 rounded" />
                    </div>
                  </div>
                  {/* Chat bubbles mockup */}
                  <div className="p-4 space-y-3">
                    <div className="h-8 w-2/3 bg-gray-800 rounded-lg rounded-tl-none" />
                    <div className="h-12 w-3/4 bg-primary/20 border border-primary/20 rounded-lg rounded-tr-none ml-auto" />
                    <div className="h-8 w-1/2 bg-gray-800 rounded-lg rounded-tl-none" />
                  </div>
                  {/* Footer mockup */}
                  <div className="absolute bottom-0 w-full h-10 bg-gray-900 border-t border-gray-800 flex items-center px-3">
                     <div className="h-6 w-full bg-gray-800 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold">Confirmation</h1>
            <div className="bg-[#0F1117] rounded-xl border border-gray-800 p-6 space-y-4">
              <div className="flex justify-between items-start border-b border-gray-800 pb-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Property</p>
                  <p className="font-bold text-lg">{formData.name}</p>
                  <p className="text-sm text-gray-400">{formData.type} • {formData.country}</p>
                </div>
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: formData.brand_color }}
                />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">WhatsApp ID</p>
                <p className="text-sm font-mono text-gray-300">{formData.whatsapp_phone_number_id || 'Not provided'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Webhook Token</p>
                <p className="text-sm font-mono text-gray-300">{formData.whatsapp_webhook_verify_token}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-4 bg-secondary/10 border border-secondary/30 rounded-lg text-sm text-secondary-foreground">
              <span className="text-xl">🚀</span>
              <p>Great! Your property is ready to be launched. Once you click the button below, we&apos;ll initialize your dashboard.</p>
            </div>
          </div>
        )}

        {/* Navigation Footer */}
        <div className="flex justify-between mt-12 pt-8 border-t border-gray-800">
          <button
            onClick={prevStep}
            disabled={step === 1 || loading}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              step === 1 ? 'opacity-0' : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            Back
          </button>
          
          {step < 4 ? (
            <button
              onClick={nextStep}
              className="px-8 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-bold transition-transform active:scale-95"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleLaunch}
              disabled={loading || !formData.name}
              className="px-8 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-bold transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  Launching...
                </>
              ) : 'Launch Property'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
