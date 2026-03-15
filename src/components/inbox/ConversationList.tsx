'use client'

import { format } from 'date-fns'
import { Search, Filter } from 'lucide-react'

interface Conversation {
  id: string
  last_message_at: string
  status: 'active' | 'human_takeover' | 'resolved'
  contacts: {
    name: string
    phone_number: string
    user_type: 'guest' | 'owner' | 'investor'
  }
  messages: {
    content: any
  }[]
}

interface ConversationListProps {
  conversations: Conversation[]
  selectedId?: string
  onSelect: (id: string) => void
  filter: string
  setFilter: (filter: 'all' | 'active' | 'human_takeover' | 'resolved') => void
  search: string
  setSearch: (search: string) => void
}

export default function ConversationList({
  conversations,
  selectedId,
  onSelect,
  filter,
  setFilter,
  search,
  setSearch
}: ConversationListProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500'
      case 'human_takeover': return 'bg-orange-500'
      case 'resolved': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }

  const getUserTypeColor = (type: string) => {
    switch (type) {
      case 'guest': return 'bg-blue-500'
      case 'owner': return 'bg-purple-500'
      case 'investor': return 'bg-amber-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="flex flex-col h-full border-r border-gray-800 bg-[#0F1117]">
      <div className="p-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#1A1D2E] border-none rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:ring-1 focus:ring-primary outline-none"
          />
        </div>
        
        <div className="flex gap-1 overflow-x-auto pb-1 no-scrollbar">
          {['all', 'active', 'human_takeover', 'resolved'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap transition-colors ${
                filter === f ? 'bg-primary text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {f.replace('_', ' ').toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-gray-500">
            <p className="text-sm">No conversations found</p>
          </div>
        ) : (
          conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => onSelect(conv.id)}
              className={`w-full text-left p-4 border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors relative ${
                selectedId === conv.id ? 'bg-gray-800/50 border-l-4 border-l-primary' : ''
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className="font-semibold text-white truncate max-w-[140px]">
                  {conv.contacts?.name || conv.contacts?.phone_number}
                </span>
                <span className="text-[10px] text-gray-500 whitespace-nowrap">
                  {conv.last_message_at ? format(new Date(conv.last_message_at), 'HH:mm') : ''}
                </span>
              </div>
              
              <div className="flex items-center gap-2 mb-2">
                <span className={`w-2 h-2 rounded-full ${getStatusColor(conv.status)}`} />
                <span className={`text-[10px] px-1.5 py-0.5 rounded text-white ${getUserTypeColor(conv.contacts?.user_type)}`}>
                  {conv.contacts?.user_type}
                </span>
              </div>

              <p className="text-xs text-gray-400 truncate">
                {conv.messages?.[0]?.content?.text?.body || 
                 conv.messages?.[0]?.content?.interactive?.button_reply?.title || 
                 'No messages'}
              </p>
            </button>
          ))
        )}
      </div>
    </div>
  )
}
