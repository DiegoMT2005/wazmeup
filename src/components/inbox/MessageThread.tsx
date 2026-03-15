'use client'

import { useEffect, useRef } from 'react'
import { format } from 'date-fns'
import { Check, CheckCheck } from 'lucide-react'

interface Message {
  id: string
  created_at: string
  direction: 'inbound' | 'outbound'
  message_type: string
  content: any
  status: 'sent' | 'delivered' | 'read' | 'failed'
}

interface MessageThreadProps {
  messages: Message[]
}

export default function MessageThread({ messages }: MessageThreadProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const renderStatus = (status: string) => {
    switch (status) {
      case 'sent': return <Check className="w-3 h-3 text-gray-400" />
      case 'delivered': return <CheckCheck className="w-3 h-3 text-gray-400" />
      case 'read': return <CheckCheck className="w-3 h-3 text-primary" />
      default: return null
    }
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar bg-[#0B0D13]">
      {messages.map((msg) => {
        const isInbound = msg.direction === 'inbound'
        return (
          <div
            key={msg.id}
            className={`flex ${isInbound ? 'justify-start' : 'justify-end'}`}
          >
            <div
              className={`max-w-[70%] rounded-2xl px-4 py-2 relative group transition-all ${
                isInbound
                  ? 'bg-[#1A1D2E] text-white rounded-tl-none'
                  : 'bg-primary text-white rounded-tr-none'
              }`}
            >
              <p className="text-sm">
                {msg.content?.text?.body || 
                 msg.content?.body || 
                 msg.content?.interactive?.button_reply?.title || 
                 'Unsupported message type'}
              </p>
              
              <div className="flex items-center justify-end gap-1 mt-1 opacity-60">
                <span className="text-[10px]">
                  {format(new Date(msg.created_at), 'HH:mm')}
                </span>
                {!isInbound && renderStatus(msg.status)}
              </div>
            </div>
          </div>
        )
      })}
      <div ref={bottomRef} />
    </div>
  )
}
