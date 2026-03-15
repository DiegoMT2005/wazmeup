'use client'

import { useState, useEffect } from 'react'

export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { 
  MessageSquare, 
  UserPlus, 
  Zap, 
  Target,
  Send,
  Plus,
  Settings,
  ArrowRight,
  RefreshCw,
  MoreVertical
} from 'lucide-react'
import ActivityChart from '@/components/dashboard/ActivityChart'
import { Skeleton, CardSkeleton } from '@/components/ui/Skeleton'
import ErrorBoundary from '@/components/ui/ErrorBoundary'
import { formatDistanceToNow } from 'date-fns'

export default function DashboardPage() {
  const [stats, setStats] = useState<any>({
    active: 0,
    takeovers: 0,
    messages: 0,
    resolutionRate: 0
  })
  const [recentConversations, setRecentConversations] = useState<any[]>([])
  const [chartData, setChartData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [apiStatus, setApiStatus] = useState<'valid' | 'invalid' | 'checking'>('checking')

  const supabase = createClient()

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      try {
        const today = new Date().toISOString().split('T')[0]
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

        // 1. Fetch Stats
        const [
          { count: activeConvs },
          { count: todayTakeovers },
          { count: weekMessages },
          { count: resolvedCount },
          { count: totalClosed }
        ] = await Promise.all([
          supabase.from('conversations').select('*', { count: 'exact', head: true }).eq('status', 'active'),
          supabase.from('conversations').select('*', { count: 'exact', head: true }).eq('status', 'human_takeover').gte('updated_at', today),
          supabase.from('messages').select('*', { count: 'exact', head: true }).gte('created_at', sevenDaysAgo),
          supabase.from('conversations').select('*', { count: 'exact', head: true }).eq('status', 'resolved').gte('updated_at', sevenDaysAgo),
          supabase.from('conversations').select('*', { count: 'exact', head: true }).in('status', ['resolved', 'human_takeover']).gte('updated_at', sevenDaysAgo)
        ])

        const resRate = totalClosed && totalClosed > 0 ? (resolvedCount! / totalClosed) * 100 : 100

        setStats({
          active: activeConvs || 0,
          takeovers: todayTakeovers || 0,
          messages: weekMessages || 0,
          resolutionRate: Math.round(resRate)
        })

        // 2. Fetch Recent Conversations
        const { data: convs } = await supabase
          .from('conversations')
          .select('*, contacts(*), messages(content)')
          .order('last_message_at', { ascending: false })
          .limit(5)
        
        setRecentConversations(convs || [])

        // 3. Mock Chart Data (Normally would be a group-by query)
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        const mockChart = days.map(day => ({
          name: day,
          inbound: Math.floor(Math.random() * 50) + 10,
          outbound: Math.floor(Math.random() * 40) + 20
        }))
        setChartData(mockChart)

        // 4. Check API Status
        const { data: property } = await supabase.from('properties').select('whatsapp_access_token').limit(1).single()
        setApiStatus(property?.whatsapp_access_token ? 'valid' : 'invalid')

      } catch (error) {
        console.error('Dashboard fetch error:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [supabase])

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Property Overview</h1>
          <p className="text-gray-400">Welcome back. Here&apos;s what&apos;s happening today.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg">
          <div className={`w-2 h-2 rounded-full ${apiStatus === 'valid' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : apiStatus === 'checking' ? 'bg-yellow-500' : 'bg-red-500'}`} />
          <span className="text-xs font-medium text-gray-300">
            {apiStatus === 'valid' ? 'WhatsApp API Connected' : apiStatus === 'checking' ? 'Checking Status...' : 'API Disconnected'}
          </span>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : (
          <>
            <StatCard 
              title="Active Conversations" 
              value={stats.active} 
              icon={<MessageSquare className="text-primary w-5 h-5" />}
              trend="+2 since last hour"
            />
            <StatCard 
              title="Human Takeovers Today" 
              value={stats.takeovers} 
              icon={<UserPlus className="text-orange-500 w-5 h-5" />}
              trend="Down 15% from yesterday"
            />
            <StatCard 
              title="Messages This Week" 
              value={stats.messages} 
              icon={<Zap className="text-purple-500 w-5 h-5" />}
              trend="+434 new messages"
            />
            <StatCard 
              title="Bot Resolution Rate" 
              value={`${stats.resolutionRate}%`} 
              icon={<Target className="text-green-500 w-5 h-5" />}
              trend="Goal: 95%"
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Conversations */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">Recent Conversations</h2>
            <Link href="/conversations" className="text-primary hover:text-primary-dark transition-colors text-sm font-medium flex items-center gap-1 group">
              View All <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          <div className="bg-secondary/10 border border-gray-800 rounded-2xl overflow-hidden">
            {isLoading ? (
              <div className="p-6 space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : recentConversations.length === 0 ? (
              <div className="p-12 text-center space-y-4">
                <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto">
                  <MessageSquare className="w-8 h-8 text-gray-500" />
                </div>
                <div>
                  <h3 className="text-white font-medium">No conversations yet</h3>
                  <p className="text-sm text-gray-400">Incoming WhatsApp messages will appear here.</p>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-gray-800">
                {recentConversations.map((conv) => (
                  <div key={conv.id} className="p-4 hover:bg-gray-800/30 transition-colors flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-primary font-bold">
                        {(conv.contacts?.name || '?')[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-white">{conv.contacts?.name || conv.contacts?.phone_number}</p>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded text-white ${
                            conv.contacts?.user_type === 'guest' ? 'bg-blue-500' :
                            conv.contacts?.user_type === 'owner' ? 'bg-purple-500' : 'bg-amber-500'
                          }`}>
                            {conv.contacts?.user_type}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 truncate max-w-[200px]">
                          {conv.messages?.[0]?.content?.text?.body || 'No messages'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-gray-500">
                        {conv.last_message_at ? formatDistanceToNow(new Date(conv.last_message_at), { addSuffix: true }) : ''}
                      </p>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${
                        conv.status === 'active' ? 'border-green-800 text-green-500 bg-green-900/10' :
                        conv.status === 'human_takeover' ? 'border-orange-800 text-orange-500 bg-orange-900/10' :
                        'border-gray-800 text-gray-500 bg-gray-900/10'
                      }`}>
                        {conv.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white">Quick Actions</h2>
          <div className="bg-secondary/10 border border-gray-800 rounded-2xl p-6 space-y-4">
            <Link href="/settings" className="flex items-center gap-3 w-full p-4 bg-gray-900/50 hover:bg-gray-800 border border-gray-800 rounded-xl transition-all group">
              <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                <Send className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-white">Send Weekly Report</p>
                <p className="text-[10px] text-gray-500 italic">Broadcast update to all owners</p>
              </div>
            </Link>

            <Link href="/settings/whatsapp" className="flex items-center gap-3 w-full p-4 bg-gray-900/50 hover:bg-gray-800 border border-gray-800 rounded-xl transition-all group">
              <div className="p-2 bg-purple-500/10 rounded-lg group-hover:bg-purple-500/20 transition-colors">
                <RefreshCw className="w-5 h-5 text-purple-500" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-white">Test Connection</p>
                <p className="text-[10px] text-gray-500 italic">Verify Meta API credentials</p>
              </div>
            </Link>

            <Link href="/onboarding" className="flex items-center gap-3 w-full p-4 bg-gray-900/50 hover:bg-gray-800 border border-gray-800 rounded-xl transition-all group">
              <div className="p-2 bg-green-500/10 rounded-lg group-hover:bg-green-500/20 transition-colors">
                <Plus className="w-5 h-5 text-green-500" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-white">Add New Property</p>
                <p className="text-[10px] text-gray-500 italic">Expand your portfolio</p>
              </div>
            </Link>

            <Link href="/settings" className="flex items-center gap-3 w-full p-4 bg-gray-900/50 hover:bg-gray-800 border border-gray-800 rounded-xl transition-all group">
              <div className="p-2 bg-gray-700/10 rounded-lg group-hover:bg-gray-700/20 transition-colors">
                <Settings className="w-5 h-5 text-gray-400" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-white">General Settings</p>
                <p className="text-[10px] text-gray-500 italic">Manage team and notifications</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Activity Chart Section */}
      <ErrorBoundary>
        <div className="w-full">
          {isLoading ? (
            <Skeleton className="h-[350px] w-full" />
          ) : (
            <ActivityChart data={chartData} />
          )}
        </div>
      </ErrorBoundary>
    </div>
  )
}

function StatCard({ title, value, icon, trend }: { title: string, value: string | number, icon: React.ReactNode, trend: string }) {
  return (
    <div className="bg-secondary/10 border border-gray-800 p-6 rounded-2xl space-y-4 hover:border-gray-700 transition-colors group">
      <div className="flex justify-between items-start">
        <div className="p-2 bg-gray-900 rounded-xl group-hover:bg-gray-800 transition-colors">
          {icon}
        </div>
        <MoreVertical className="w-4 h-4 text-gray-600 cursor-pointer hover:text-gray-400" />
      </div>
      <div>
        <h3 className="text-sm font-medium text-gray-400 mb-1">{title}</h3>
        <p className="text-3xl font-bold text-white">{value}</p>
      </div>
      <div className="pt-2 border-t border-gray-800/50">
        <p className="text-[10px] text-gray-500 flex items-center gap-1">
          <Zap className="w-3 h-3 text-yellow-500 fill-yellow-500" />
          {trend}
        </p>
      </div>
    </div>
  )
}
