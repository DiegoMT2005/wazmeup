'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  GitBranch, 
  Plus, 
  ToggleLeft, 
  Calendar, 
  Zap, 
  Info,
  Clock,
  MoreVertical
} from 'lucide-react'
import { format } from 'date-fns'

export const dynamic = 'force-dynamic'

interface Flow {
  id: string
  name: string
  trigger_type: string
  trigger_value: string
  is_active: boolean
  updated_at: string
}

export default function FlowBuilderPage() {
  const [flows, setFlows] = useState<Flow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchFlows() {
      setIsLoading(true)
      try {
        const { data, error } = await supabase
          .from('flows')
          .select('*')
          .order('updated_at', { ascending: false })
        
        if (error) throw error
        setFlows(data || [])
      } catch (error) {
        console.error('Error fetching flows:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchFlows()
  }, [supabase])

  const toggleFlow = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('flows')
        .update({ is_active: !currentStatus })
        .eq('id', id)
      
      if (error) throw error
      
      setFlows(flows.map(f => f.id === id ? { ...f, is_active: !currentStatus } : f))
    } catch (error) {
      console.error('Error toggling flow:', error)
    }
  }

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Flow Builder</h1>
          <p className="text-gray-400">Design and manage your automated conversation logic.</p>
        </div>
        <div className="group relative">
          <button 
            disabled
            className="flex items-center gap-2 bg-gray-800 text-gray-500 px-4 py-2 rounded-lg font-medium cursor-not-allowed border border-gray-700 transition-all opacity-50"
          >
            <Plus className="w-4 h-4" />
            New Flow
          </button>
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-gray-800">
            Coming in Phase 2
          </div>
        </div>
      </div>

      {/* Coming Soon Card */}
      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 flex items-start gap-4 shadow-lg shadow-primary/5">
        <div className="p-3 bg-primary/10 rounded-xl">
          <Info className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white mb-1">Visual Flow Builder Coming Soon</h3>
          <p className="text-gray-400 text-sm max-w-2xl">
            We are working on a drag-and-drop interface for complex branching logic. 
            For now, default flows represent the core hospitality patterns and are active for all properties.
          </p>
        </div>
      </div>

      {/* Flows Table */}
      <div className="bg-secondary/10 border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-gray-800 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Active Flows</h2>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Clock className="w-3 h-3" />
            <span>Updated in real-time</span>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-900/50">
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-800">Flow Name</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-800">Trigger Type</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-800">User Type</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-800">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-800">Last Updated</th>
                <th className="px-6 py-4 text-right border-b border-gray-800"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {isLoading ? (
                Array(3).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-6"><div className="h-4 bg-gray-800 rounded w-32"></div></td>
                    <td className="px-6 py-6"><div className="h-4 bg-gray-800 rounded w-24"></div></td>
                    <td className="px-6 py-6"><div className="h-4 bg-gray-800 rounded w-20"></div></td>
                    <td className="px-6 py-6"><div className="h-4 bg-gray-800 rounded w-16"></div></td>
                    <td className="px-6 py-6"><div className="h-4 bg-gray-800 rounded w-24"></div></td>
                    <td className="px-6 py-6 text-right"><div className="h-4 bg-gray-800 rounded w-4 inline-block"></div></td>
                  </tr>
                ))
              ) : flows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-gray-500">
                    <Zap className="w-12 h-12 mx-auto mb-4 opacity-10" />
                    No custom flows found. System defaults are currently managing your interactions.
                  </td>
                </tr>
              ) : (
                flows.map((flow) => (
                  <tr key={flow.id} className="hover:bg-gray-800/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-900 rounded-lg border border-gray-800 text-primary group-hover:border-primary/30 transition-colors">
                          <GitBranch className="w-4 h-4" />
                        </div>
                        <span className="font-semibold text-white">{flow.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-medium text-gray-300 bg-gray-800 px-2 py-1 rounded">
                        {flow.trigger_type.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                       <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                        flow.trigger_value === 'guest' ? 'bg-blue-500/10 text-blue-500' :
                        flow.trigger_value === 'owner' ? 'bg-purple-500/10 text-purple-500' : 
                        'bg-amber-500/10 text-amber-500'
                      }`}>
                        {flow.trigger_value || 'Global'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => toggleFlow(flow.id, flow.is_active)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${flow.is_active ? 'bg-primary' : 'bg-gray-700'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${flow.is_active ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-gray-500">
                        {flow.updated_at ? format(new Date(flow.updated_at), 'MMM dd, yyyy') : 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-gray-600 hover:text-white transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
