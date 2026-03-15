export type WhatsAppMessageType = 'text' | 'image' | 'document' | 'template' | 'interactive'

export async function sendWhatsAppMessage(
  propertyId: string,
  to: string,
  messageType: WhatsAppMessageType,
  content: any
) {
  const response = await fetch('/api/whatsapp/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      property_id: propertyId,
      to,
      message_type: messageType,
      content,
    }),
  })

  return response.json()
}

export async function sendTextMessage(propertyId: string, to: string, text: string) {
  return sendWhatsAppMessage(propertyId, to, 'text', { body: text })
}

export async function sendInteractiveButtons(
  propertyId: string,
  to: string,
  bodyText: string,
  buttons: { id: string; title: string }[]
) {
  return sendWhatsAppMessage(propertyId, to, 'interactive', {
    type: 'button',
    body: { text: bodyText },
    action: {
      buttons: buttons.map((b) => ({
        type: 'reply',
        reply: { id: b.id, title: b.title },
      })),
    },
  })
}

export async function sendTemplateMessage(
  propertyId: string,
  to: string,
  templateName: string,
  languageCode: string,
  components?: any[]
) {
  return sendWhatsAppMessage(propertyId, to, 'template', {
    name: templateName,
    language: { code: languageCode },
    components,
  })
}
