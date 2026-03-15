import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateOwnerReport, formatOwnerReportMessage } from '@/lib/reports/ownerReport'
import { sendWhatsAppMessage } from '@/lib/whatsapp/client'

export async function POST(req: Request) {
  try {
    const { property_id } = await req.json()
    const supabase = createClient()

    let properties: Array<{ id: string, name: string }> = []
    if (property_id) {
      const { data } = await supabase.from('properties').select('id, name').eq('id', property_id).single()
      if (data) properties = [data]
    } else {
      const { data } = await supabase.from('properties').select('id, name').eq('is_active', true)
      if (data) properties = data
    }

    const results = []

    for (const property of properties) {
      // 1. Generate Report
      const report = await generateOwnerReport(property.id)
      const message = formatOwnerReportMessage(report, property.name)

      // 2. Find Owners for this property
      const { data: owners } = await supabase
        .from('contacts')
        .select('phone_number')
        .eq('property_id', property.id)
        .eq('user_type', 'owner')

      if (owners && owners.length > 0) {
        for (const owner of owners) {
          // 3. Send via WhatsApp
          await sendWhatsAppMessage(
            property.id,
            owner.phone_number,
            'text',
            { body: message }
          )
        }

        // 4. Log report to DB
        await supabase.from('reports').insert({
          property_id: property.id,
          type: 'weekly_owner_summary',
          content: report,
          sent_at: new Date().toISOString()
        })

        results.push({ property: property.name, status: 'sent', recipients: owners.length })
      } else {
        results.push({ property: property.name, status: 'skipped', reason: 'no owners found' })
      }
    }

    return NextResponse.json({ success: true, processed: results })
  } catch (error: any) {
    console.error('Report delivery failed:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
