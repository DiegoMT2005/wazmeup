import { createClient } from '@/lib/supabase/server'
import { FlowContext, FlowNode, FlowReply } from './types'
import { GUEST_FLOWS, OWNER_DEFAULT_FLOW, INVESTOR_DEFAULT_FLOW } from './defaultFlows'

export async function processMessage(
  context: FlowContext,
  incomingMessage: string
): Promise<FlowReply[]> {
  const supabase = createClient()
  
  // 1. Fetch Property Data for Variable Replacement
  const { data: property } = await supabase
    .from('properties')
    .select('*')
    .eq('id', context.propertyId)
    .single()

  const replaceVariables = (text: string) => {
    if (!text || !property) return text
    return text
      .replace(/\[property_name\]/g, property.name || 'our property')
      .replace(/\[property_phone\]/g, property.whatsapp_phone_number || 'reception')
      .replace(/\[property_address\]/g, property.address || 'our address')
      .replace(/\[google_maps_link\]/g, 'https://maps.google.com')
      .replace(/\[menu_link\]/g, 'https://wazmeup.com/menu')
      .replace(/\[google_review_link\]/g, 'https://g.page/review')
      .replace(/\[request_id\]/g, Math.random().toString(36).substring(7).toUpperCase())
  }

  // 2. Determine the flow to use
  let flowNodes: FlowNode[] = []
  if (context.userType === 'guest') {
    // Basic logic: if message contains help/issue/problem, start in-stay flow
    const keywords = ['help', 'issue', 'problem', 'maint']
    const startInStay = keywords.some(k => incomingMessage.toLowerCase().includes(k))
    
    // For now, default to pre-arrival if not specified or at the start
    const flowKey = context.currentNodeId?.startsWith('maint') || startInStay ? 'in-stay' : 'pre-arrival'
    flowNodes = GUEST_FLOWS[flowKey]
  } else if (context.userType === 'owner') {
    flowNodes = OWNER_DEFAULT_FLOW
  } else if (context.userType === 'investor') {
    flowNodes = INVESTOR_DEFAULT_FLOW
  } else {
    return []
  }

  // 3. Find current node or start from 'welcome'
  let currentNodeId = context.currentNodeId || 'welcome'
  let currentNode = flowNodes.find((n) => n.id === currentNodeId)

  if (!currentNode) {
    currentNode = flowNodes.find((n) => n.id === 'welcome')
    if (!currentNode) return []
  }

  const replies: FlowReply[] = []

  // 4. Input Processing Logic
  if (currentNode.type === 'buttons') {
    // WhatsApp interactive buttons/list response is the ID
    const buttons = currentNode.content.type === 'list' 
      ? currentNode.content.action.sections.flatMap((s: any) => s.rows)
      : currentNode.content.action.buttons.map((b: any) => b.reply)

    const selected = buttons.find(
      (b: any) => b.id === incomingMessage || b.title.toLowerCase() === incomingMessage.toLowerCase()
    )

    if (selected) {
      // Transition based on ID
      const targetNode = flowNodes.find(n => n.id === selected.id)
      if (targetNode) {
        currentNode = targetNode
      } else {
        // Fallback for custom logic like 'staff' or 'contact'
        if (selected.id === 'staff' || selected.id === 'contact_staff' || selected.id === 'contact') {
          currentNode = flowNodes.find(n => n.type === 'end') || currentNode
        }
      }
    }
  } else if (currentNode?.type === 'text' && currentNode.next) {
    // If it's a simple text node waiting for input (like maintenance description)
    currentNode = flowNodes.find(n => n.id === currentNode!.next) || currentNode
  }

  // 5. Generate Response Content
  if (currentNode.type === 'text') {
    replies.push({ type: 'text', content: { body: replaceVariables(currentNode.content) } })
  } else if (currentNode.type === 'buttons') {
    const content = JSON.parse(JSON.stringify(currentNode.content))
    if (content.body?.text) content.body.text = replaceVariables(content.body.text)
    replies.push({ type: 'interactive', content })
  } else if (currentNode.type === 'end') {
    replies.push({ type: 'text', content: { body: replaceVariables(currentNode.content) } })
    
    await supabase
      .from('conversations')
      .update({ status: 'human_takeover' })
      .eq('id', context.conversationId)
  }

  // 6. Persistence: Update current_flow_node
  // Handle automatic transitions (e.g. from welcome text to menu)
  if (currentNode.next && currentNode.type === 'text') {
    // If it's a sequential message, we might want to return multiple replies
    // But for now we just move the pointer
  }

  await supabase
    .from('conversations')
    .update({ current_flow_node: currentNode.id })
    .eq('id', context.conversationId)

  return replies
}
