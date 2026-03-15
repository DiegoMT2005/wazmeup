import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  if (mode && token) {
    const { data: property, error } = await supabaseAdmin
      .from('properties')
      .select('*')
      .eq('whatsapp_webhook_verify_token', token)
      .single()

    if (property && mode === 'subscribe') {
      return new Response(challenge, { status: 200 })
    }
  }

  return new Response('Forbidden', { status: 403 })
}

export async function POST(request: Request) {
  // IMMEDIATELY return 200 OK
  const response = NextResponse.json({ status: 'ok' });

  // Process asynchronously
  (async () => {
    try {
      const body = await request.json()
      const entry = body.entry?.[0]
      const change = entry?.changes?.[0]
      const value = change?.value
      const message = value?.messages?.[0]
      const phoneNumberId = value?.metadata?.phone_number_id

      // If no message, just return (could be a status update)
      if (!message) return

      // 1. Find property WHERE whatsapp_phone_number_id = phoneNumberId
      const { data: property } = await supabaseAdmin
        .from('properties')
        .select('id, name, whatsapp_access_token')
        .eq('whatsapp_phone_number_id', phoneNumberId)
        .single()

      if (!property) {
        console.error('Property not found for phone_number_id:', phoneNumberId)
        return
      }

      // 2. Find or create contact by phone_number = message.from
      let { data: contact } = await supabaseAdmin
        .from('contacts')
        .select('id')
        .eq('property_id', property.id)
        .eq('phone_number', message.from)
        .single()

      if (!contact) {
        const { data: newContact, error } = await supabaseAdmin
          .from('contacts')
          .insert({
            property_id: property.id,
            phone_number: message.from,
            name: value.contacts?.[0]?.profile?.name || message.from,
            user_type: 'guest'
          })
          .select()
          .single()
        
        if (error || !newContact) throw error || new Error('Failed to create contact')
        contact = newContact
      }

      if (!contact) return

      // 3. Find or create conversation for this contact
      let { data: conversation } = await supabaseAdmin
        .from('conversations')
        .select('*')
        .eq('property_id', property.id)
        .eq('contact_id', contact.id)
        .neq('status', 'resolved')
        .single()

      if (!conversation) {
        const { data: newConversation, error } = await supabaseAdmin
          .from('conversations')
          .insert({
            property_id: property.id,
            contact_id: contact.id,
            status: 'active',
            last_message_at: new Date().toISOString()
          })
          .select()
          .single()
        
        if (error) throw error
        conversation = newConversation
      }

      // 4. Insert into messages table
      const { error: msgError } = await supabaseAdmin
        .from('messages')
        .insert({
          conversation_id: conversation.id,
          whatsapp_message_id: message.id,
          direction: 'inbound',
          message_type: message.type,
          content: message,
          status: 'delivered'
        })

      if (msgError) {
        if (msgError.code === '23505') {
          // Duplicate message, skip
          return
        }
        throw msgError
      }

      // 5. Update conversation last_message_at = now()
      await supabaseAdmin
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', conversation.id)

      // 6. Send auto-reply for new conversations or first messages
      const autoReplyText = `👋 Hi! Welcome to ${property.name}. I'm your WazMeUp assistant. How can I help?

Reply with:
1 - Check-in info
2 - Report an issue
3 - Speak to staff`

      // Send auto-reply using the internal API
      if (property.whatsapp_access_token) {
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/whatsapp/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone_number_id: phoneNumberId,
            access_token: property.whatsapp_access_token,
            to: message.from,
            type: 'text',
            text: autoReplyText
          })
        })
      }

    } catch (error) {
      console.error('Webhook processing error:', error)
    }
  })()

  return response
}
