'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { 
  Building2, 
  Plus, 
  MessageSquare, 
  Zap, 
  Settings, 
  ArrowRight,
  ExternalLink,
  RefreshCw,
  AlertCircle
} from 'lucide-react'
import { CardSkeleton } from '@/components/ui/Skeleton'

export const dynamic = 'force-dynamic'

interface Property {
  id: string
  name: string
  plan: 'starter' | 'growth' | 'enterprise'
  whatsapp_phone_number_id: string | null
  active_conversations: number
  messages_this_week: number
}

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchProperties() {
      setIsLoading(true)
      try {
        const { data: props, error: propsError } = await supabase
          .from('properties')
          .select('*')
        
        if (propsError) throw propsError

        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

        const extendedProps = await Promise.all((props || []).map(async (prop: any) => {
          // Fetch active convs for this property
          const { count: activeCount } = await supabase
            .from('conversations')
            .select('*', { count: 'exact', head: true })
            .eq('property_id', prop.id)
            .eq('status', 'active')

          // Fetch messages this week for this property
          // Messages are linked via conversations
          const { count: msgCount } = await supabase
            .from('messages')
            .select('*, conversations!inner(property_id)', { count: 'exact', head: true })
            .eq('conversations.property_id', prop.id)
            .gte('created_at', sevenDaysAgo)

          return {
            ...prop,
            active_conversations: activeCount || 0,
            messages_this_week: msgCount || 0
          }
        }))

        setProperties(extendedProps)
      } catch (error) {
        console.error('Error fetching properties:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProperties()
  }, [supabase])

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Properties</h1>
          <p className="text-gray-400">Manage your property portfolio and WhatsApp integrations.</p>
        </div>
        <Link 
          href="/onboarding"
          className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-medium transition-all shadow-lg shadow-primary/20"
        >
          <Plus className="w-4 h-4" />
          Add New Property
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : properties.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-secondary/10 border border-dashed border-gray-800 rounded-3xl space-y-6">
          <div className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center border border-gray-800">
            <Building2 className="w-10 h-10 text-gray-600" />
          </div>
          <div className="text-center">
            <h3 className="text-xl font-bold text-white">No properties yet</h3>
            <p className="text-gray-500 mt-1 max-w-xs">Add your first property to start automating guest communication.</p>
          </div>
          <Link 
            href="/onboarding"
            className="group flex items-center justify-center w-16 h-16 bg-primary hover:bg-primary-dark rounded-full transition-all hover:scale-110 shadow-xl shadow-primary/30"
          >
            <Plus className="w-8 h-8 text-white group-hover:rotate-90 transition-transform" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((prop) => (
            <PropertyCard key={prop.id} property={prop} />
          ))}
        </div>
      )}
    </div>
  )
}

function PropertyCard({ property }: { property: Property }) {
  const isConnected = !!property.whatsapp_phone_number_id

  return (
    <div className="bg-secondary/10 border border-gray-800 rounded-2xl p-6 space-y-6 hover:border-primary/30 transition-all group relative overflow-hidden">
      {/* Glow Effect */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl -mr-16 -mt-16 group-hover:bg-primary/10 transition-all" />
      
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-bold text-white leading-tight">{property.name}</h3>
            <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${
              property.plan === 'enterprise' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
              property.plan === 'growth' ? 'bg-purple-500/10 text-purple-500 border border-purple-500/20' :
              'bg-gray-500/10 text-gray-400 border border-gray-500/20'
            }`}>
              {property.plan}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]'}`} />
            <span className="text-xs text-gray-400 font-medium">
              {isConnected ? 'WhatsApp Connected' : 'WhatsApp Disconnected'}
            </span>
          </div>
        </div>
        <div className="p-3 bg-gray-900 rounded-xl group-hover:bg-primary/10 transition-colors">
          <Building2 className={`w-6 h-6 ${isConnected ? 'text-primary' : 'text-gray-600'}`} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-900/50 p-3 rounded-xl border border-gray-800">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <MessageSquare className="w-3 h-3" />
            <span className="text-[10px] font-medium uppercase tracking-wider">Active</span>
          </div>
          <p className="text-xl font-bold text-white">{property.active_conversations}</p>
        </div>
        <div className="bg-gray-900/50 p-3 rounded-xl border border-gray-800">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <Zap className="w-3 h-3 text-yellow-500" />
            <span className="text-[10px] font-medium uppercase tracking-wider">Week</span>
          </div>
          <p className="text-xl font-bold text-white">{property.messages_this_week}</p>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Link 
          href={`/properties/${property.id}`}
          className="flex-1 flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all group/btn"
        >
          Manage
          <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
        </Link>
        <Link 
          href="/settings/whatsapp"
          className="flex items-center justify-center bg-gray-900 hover:bg-gray-800 text-gray-400 hover:text-white px-4 py-2.5 rounded-xl border border-gray-800 transition-all font-medium"
          title="Test WhatsApp Connection"
        >
          <RefreshCw className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}
