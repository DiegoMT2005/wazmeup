export type UserType = 'guest' | 'owner' | 'investor'
export type NodeType = 'text' | 'buttons' | 'condition' | 'end'

export interface FlowCondition {
  match: string
  next: string
}

export interface FlowNode {
  id: string
  type: NodeType
  content: any
  next?: string
  conditions?: FlowCondition[]
}

export interface Flow {
  id: string
  property_id: string
  name: string
  user_type: UserType
  nodes: FlowNode[]
}

export interface FlowContext {
  conversationId: string
  contactId: string
  propertyId: string
  userType: UserType
  currentNodeId?: string
}

export interface FlowReply {
  type: 'text' | 'interactive'
  content: any
}
