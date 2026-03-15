import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { phone_number_id, access_token, to, type, text, template } = await request.json()

    if (!phone_number_id || !access_token || !to || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    let messageBody: any = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type,
    }

    // Handle different message types
    if (type === 'template') {
      if (!template) {
        return NextResponse.json({ error: 'Template is required for template messages' }, { status: 400 })
      }
      messageBody.template = template
    } else if (type === 'text') {
      if (!text) {
        return NextResponse.json({ error: 'Text is required for text messages' }, { status: 400 })
      }
      messageBody.text = { body: text }
    } else {
      return NextResponse.json({ error: 'Unsupported message type' }, { status: 400 })
    }

    const response = await fetch(
      `https://graph.facebook.com/v19.0/${phone_number_id}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageBody),
      }
    )

    const data = await response.json()

    return NextResponse.json(data, { status: response.status })
  } catch (error: any) {
    console.error('Send message error:', error)
    return NextResponse.json(
      { error: true, details: error.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}
