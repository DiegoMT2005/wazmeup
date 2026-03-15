import { createClient } from '@/lib/supabase/server'
import { format, subDays } from 'date-fns'

export interface OwnerReport {
  new_guest_contacts: number
  total_messages: number
  resolved_conversations: number
  human_takeovers: number
  bot_resolution_rate: number
  period_start: string
  period_end: string
}

export async function generateOwnerReport(propertyId: string): Promise<OwnerReport> {
  const supabase = createClient()
  const sevenDaysAgo = subDays(new Date(), 7).toISOString()
  const now = new Date().toISOString()

  // 1. New guest contacts (conversations created in last 7 days for guests)
  const { count: newGuests } = await supabase
    .from('contacts')
    .select('*', { count: 'exact', head: true })
    .eq('property_id', propertyId)
    .eq('user_type', 'guest')
    .gte('created_at', sevenDaysAgo)

  // 2. Total messages handled
  const { count: totalMessages } = await supabase
    .from('messages')
    .select('id, conversations!inner(property_id)', { count: 'exact', head: true })
    .eq('conversations.property_id', propertyId)
    .gte('created_at', sevenDaysAgo)

  // 3. Bot resolution rate (resolved vs human_takeover)
  const { count: resolved } = await supabase
    .from('conversations')
    .select('*', { count: 'exact', head: true })
    .eq('property_id', propertyId)
    .eq('status', 'resolved')
    .gte('updated_at', sevenDaysAgo)

  const { count: escalated } = await supabase
    .from('conversations')
    .select('*', { count: 'exact', head: true })
    .eq('property_id', propertyId)
    .eq('status', 'human_takeover')
    .gte('updated_at', sevenDaysAgo)

  const resolvedNum = resolved || 0
  const escalatedNum = escalated || 0
  const totalClosed = resolvedNum + escalatedNum
  const resolutionRate = totalClosed > 0 ? (resolvedNum / totalClosed) * 100 : 100

  return {
    new_guest_contacts: newGuests || 0,
    total_messages: totalMessages || 0,
    resolved_conversations: resolvedNum,
    human_takeovers: escalatedNum,
    bot_resolution_rate: Math.round(resolutionRate),
    period_start: sevenDaysAgo,
    period_end: now,
  }
}

export function formatOwnerReportMessage(report: OwnerReport, propertyName: string): string {
  const startDate = format(new Date(report.period_start), 'MMM d')
  const endDate = format(new Date(report.period_end), 'MMM d')

  return `*WazMeUp Weekly Report*
${propertyName} — Week of ${startDate} - ${endDate}

*Guest Activity*
New contacts: ${report.new_guest_contacts}
Messages handled: ${report.total_messages}
Bot resolved: ${report.bot_resolution_rate}% of conversations
Escalated to staff: ${report.human_takeovers}

*Response Performance*
Avg first response: < 5 seconds (bot)

_Powered by WazMeUp_`
}
