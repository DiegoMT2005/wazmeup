'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  BarChart3, 
  MessageSquare, 
  Target, 
  UserPlus, 
  Zap, 
  Filter,
  ArrowUpRight,
  TrendingUp,
  Clock,
  ChevronDown
} from 'lucide-react'
import { format, formatDistanceToNow, subDays } from 'date-fns'

export const dynamic = 'force-dynamic'

interface AnalyticsStats {
  totalMessages: number
  activeConversations: number
  resolutionRate: number
  humanTakeovers: number
}

export default function AnalyticsPage() {
  const [stats, setStats] = useState<AnalyticsStats>({
    totalMessages: 0,
    activeConversations: 0,
    resolutionRate: 0,
    humanTakeovers: 0
  })
  const [recentConversations, setRecentConversations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'7d' | '30d'>('7d')
  const supabase = createClient()

  useEffect(() => {
    async function fetchAnalytics() {
      setIsLoading(true)
      try {
        const days = timeRange === '7d' ? 7 : 30
        const startDate = subDays(new Date(), days).toISOString()

        // 1. Fetch Stats
        const [
          { count: totalMsgs },
          { count: activeCount },
          { count: resolvedCount },
          { count: takeoverCount },
          { count: totalClosed }
        ] = await Promise.all([
          supabase.from('messages').select('*', { count: 'exact', head: true }).gte('created_at', startDate),
          supabase.from('conversations').select('*', { count: 'exact', head: true }).eq('status', 'active'),
          supabase.from('conversations').select('*', { count: 'exact', head: true }).eq('status', 'resolved').gte('created_at', startDate),
          supabase.from('conversations').select('*', { count: 'exact', head: true }).eq('status', 'human_takeover').gte('created_at', startDate),
          supabase.from('conversations').select('*', { count: 'exact', head: true }).in('status', ['resolved', 'human_takeover']).gte('created_at', startDate)
        ])

        const resRate = totalClosed && totalClosed > 0 ? (resolvedCount! / totalClosed) * 100 : 100

        setStats({
          totalMessages: totalMsgs || 0,
          activeConversations: activeCount || 0,
          resolutionRate: Math.round(resRate),
          humanTakeovers: takeoverCount || 0
        })

        // 2. Fetch Detailed Recent Conversations
        const { data: convs } = await supabase
          .from('conversations')
          .select(`
            *,
            contacts(name, phone_number, user_type),
            messages(content, created_at)
          `)
          .order('last_message_at', { ascending: false })
          .limit(10)
        
        setRecentConversations(convs || [])
      } catch (error) {
        console.error('Analytics error:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnalytics()
  }, [supabase, timeRange])

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Performance Analytics</h1>
          <p className="text-gray-400">Track bot efficiency and guest engagement across your portfolio.</p>
        </div>
        
        <div className="flex items-center gap-2 bg-gray-900 border border-gray-800 p-1 rounded-xl">
          <button 
            onClick={() => setTimeRange('7d')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${timeRange === '7d' ? 'bg-primary text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
          >
            Last 7 Days
          </button>
          <button 
            onClick={() => setTimeRange('30d')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${timeRange === '30d' ? 'bg-primary text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
          >
            Last 30 Days
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnalyticsCard 
          title="Total Messages" 
          value={stats.totalMessages} 
          icon={<Zap className="text-purple-500 w-5 h-5" />} 
          trend="+12%"
          isLoading={isLoading}
        />
        <AnalyticsCard 
          title="Active Conversations" 
          value={stats.activeConversations} 
          icon={<MessageSquare className="text-primary w-5 h-5" />} 
          trend="+2"
          isLoading={isLoading}
        />
        <AnalyticsCard 
          title="Bot Resolution Rate" 
          value={`${stats.resolutionRate}%`} 
          icon={<Target className="text-green-500 w-5 h-5" />} 
          trend="+4.5%"
          isLoading={isLoading}
        />
        <AnalyticsCard 
          title="Human Takeovers" 
          value={stats.humanTakeovers} 
          icon={<UserPlus className="text-orange-500 w-5 h-5" />} 
          trend="-8%"
          isLoading={isLoading}
        />
      </div>

      {/* Detailed Conversation Log */}
      <div className="bg-secondary/10 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-gray-800 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Recent Conversational Performance</h2>
          <div className="flex items-center gap-2 text-xs text-primary font-bold hover:underline cursor-pointer">
            Export CSV <ArrowUpRight className="w-3 h-3" />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-900/50">
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-800">Contact</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-800">User Type</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-800">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-800">Last Message</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-800 text-right">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-5" colSpan={5}><div className="h-4 bg-gray-800 rounded w-full"></div></td>
                  </tr>
                ))
              ) : recentConversations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-gray-500">
                    <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-10" />
                    No analytics data available for this period.
                  </td>
                </tr>
              ) : (
                recentConversations.map((conv) => (
                  <tr key={conv.id} className="hover:bg-gray-800/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-semibold text-white">{conv.contacts?.name || conv.contacts?.phone_number}</p>
                        <p className="text-[10px] text-gray-500">{conv.contacts?.phone_number}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${
                        conv.contacts?.user_type === 'guest' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                        conv.contacts?.user_type === 'owner' ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' :
                        'bg-amber-500/10 text-amber-500 border-amber-500/20'
                      }`}>
                        {conv.contacts?.user_type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                       <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                        conv.status === 'active' ? 'border-green-800/50 text-green-500 bg-green-500/5' :
                        conv.status === 'human_takeover' ? 'border-orange-800/50 text-orange-500 bg-orange-500/5' :
                        'border-gray-800 text-gray-400 bg-gray-900'
                      }`}>
                        {conv.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs text-gray-300 truncate max-w-[200px]">
                        {conv.messages?.[0]?.content?.text?.body || 'Attachment'}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <p className="text-xs font-medium text-gray-400">
                        {conv.last_message_at ? formatDistanceToNow(new Date(conv.last_message_at), { addSuffix: true }) : 'N/A'}
                      </p>
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

function AnalyticsCard({ title, value, icon, trend, isLoading }: { title: string, value: string | number, icon: React.ReactNode, trend: string, isLoading: boolean }) {
  return (
    <div className="bg-secondary/10 border border-gray-800 p-6 rounded-2xl hover:border-gray-700 transition-colors group">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-gray-900 rounded-xl group-hover:bg-primary/10 transition-colors">
          {icon}
        </div>
        <div className={`px-2 py-0.5 rounded text-[10px] font-bold ${trend.startsWith('+') ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
          {trend}
        </div>
      </div>
      {isLoading ? (
        <div className="space-y-2">
          <div className="h-4 bg-gray-800 rounded w-20 animate-pulse"></div>
          <div className="h-8 bg-gray-800 rounded w-12 animate-pulse"></div>
        </div>
      ) : (
        <>
          <h3 className="text-sm font-medium text-gray-400 mb-1">{title}</h3>
          <p className="text-3xl font-bold text-white">{value}</p>
        </>
      )}
    </div>
  )
}
