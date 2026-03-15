'use client'

import { useState, useEffect, useCallback } from 'react'

export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/client'
import ConversationList from '@/components/inbox/ConversationList'
import MessageThread from '@/components/inbox/MessageThread'
import ContactCard from '@/components/inbox/ContactCard'
import { Send, Bot, UserCog, CheckCircle } from 'lucide-react'

export default function InboxPage() {
  const [conversations, setConversations] = useState<any[]>([])
  const [selectedConversation, setSelectedConversation] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [filter, setFilter] = useState<'all' | 'active' | 'human_takeover' | 'resolved'>('all')
  const [search, setSearch] = useState('')
  const [messageInput, setMessageInput] = useState('')
  const [isSending, setIsSending] = useState(false)

  const supabase = createClient()

  // Initial Fetch: Conversations
  const fetchConversations = useCallback(async () => {
    let query = supabase
      .from('conversations')
      .select(`
        *,
        contacts(*),
        messages(content)
      `)
      .order('last_message_at', { ascending: false })

    if (filter !== 'all') {
      query = query.eq('status', filter)
    }

    const { data } = await query
    if (data) setConversations(data)
  }, [filter, supabase])

  useEffect(() => {
    fetchConversations()
  }, [fetchConversations])

  // Fetch Messages when selection changes
  useEffect(() => {
    if (!selectedConversation) return

    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', selectedConversation.id)
        .order('created_at', { ascending: true })
      if (data) setMessages(data)
    }

    fetchMessages()

    // Subscribe to new messages for this conversation
    const channel = supabase
      .channel(`messages-${selectedConversation.id}`)
      .on('postgres_changes', 
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${selectedConversation.id}`,
        },
        (payload: any) => {
          setMessages((prev) => [...prev, payload.new])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [selectedConversation, supabase])

  // Real-time for conversation list updates
  useEffect(() => {
    const channel = supabase
      .channel('conversations-list')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'conversations' },
        () => fetchConversations()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchConversations, supabase])

  const handleTakeover = async () => {
    if (!selectedConversation) return
    const { data } = await supabase
      .from('conversations')
      .update({ status: 'human_takeover' })
      .eq('id', selectedConversation.id)
      .select()
      .single()
    if (data) setSelectedConversation(data)
  }

  const handleReturnToBot = async () => {
    if (!selectedConversation) return
    const { data } = await supabase
      .from('conversations')
      .update({ status: 'active', current_flow_node: 'welcome' })
      .eq('id', selectedConversation.id)
      .select()
      .single()
    if (data) setSelectedConversation(data)
  }

  const handleResolve = async () => {
    if (!selectedConversation) return
    const { data } = await supabase
      .from('conversations')
      .update({ status: 'resolved' })
      .eq('id', selectedConversation.id)
      .select()
      .single()
    if (data) setSelectedConversation(data)
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!messageInput.trim() || !selectedConversation || isSending) return

    setIsSending(true)
    try {
      const response = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          property_id: selectedConversation.property_id,
          to: selectedConversation.contacts.phone_number,
          message_type: 'text',
          content: { body: messageInput }
        }),
      })

      const result = await response.json()
      if (response.ok) {
        // Log the message to the DB (webhook engine also does this usually, 
        // but for manual staff messages we do it here or let the webhook log it if Meta sends a hook)
        // To avoid duplicates, we'll let the Meta webhook log it as an outbound message, 
        // but for instant UI response we can optimistic update or use realtime.
        setMessageInput('')
      }
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setIsSending(false)
    }
  }

  const filteredConversations = conversations.filter(conv => {
    const contactName = conv.contacts?.name || ''
    const contactPhone = conv.contacts?.phone_number || ''
    return contactName.toLowerCase().includes(search.toLowerCase()) || 
           contactPhone.includes(search)
  })

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      {/* Left Panel: Conversation List */}
      <div className="w-80 flex-shrink-0">
        <ConversationList
          conversations={filteredConversations}
          selectedId={selectedConversation?.id}
          onSelect={(id) => setSelectedConversation(conversations.find(c => c.id === id))}
          filter={filter}
          setFilter={setFilter}
          search={search}
          setSearch={setSearch}
        />
      </div>

      {/* Right Panel: Conversation Thread */}
      <div className="flex-1 flex flex-col bg-[#0B0D13]">
        {selectedConversation ? (
          <>
            <ContactCard contact={selectedConversation.contacts} />
            
            <MessageThread messages={messages} />

            {/* Action Bar */}
            <div className="p-4 bg-[#0F1117] border-t border-gray-800">
              {selectedConversation.status === 'active' ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-primary">
                    <Bot className="w-5 h-5" />
                    <span className="text-sm font-medium">Bot is handling this conversation</span>
                  </div>
                  <button
                    onClick={handleTakeover}
                    className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-all"
                  >
                    <UserCog className="w-4 h-4" />
                    Take Over
                  </button>
                </div>
              ) : selectedConversation.status === 'human_takeover' ? (
                <div className="space-y-4">
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <input
                      type="text"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 bg-[#1A1D2E] border-none rounded-lg px-4 py-2 text-white focus:ring-1 focus:ring-primary outline-none"
                    />
                    <button
                      type="submit"
                      disabled={isSending || !messageInput.trim()}
                      className="bg-primary hover:bg-primary-dark text-white p-2 rounded-lg transition-all disabled:opacity-50"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </form>
                  <div className="flex justify-between items-center">
                    <button
                      onClick={handleReturnToBot}
                      className="text-xs text-gray-400 hover:text-white flex items-center gap-1"
                    >
                      <Bot className="w-3 h-3" /> Return to Bot
                    </button>
                    <button
                      onClick={handleResolve}
                      className="flex items-center gap-1 text-xs text-green-500 hover:text-green-400"
                    >
                      <CheckCircle className="w-3 h-3" /> Mark as Resolved
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center py-2">
                  <button
                    onClick={handleTakeover}
                    className="text-primary hover:underline text-sm font-medium"
                  >
                    Reopen Conversation
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
            <Bot className="w-16 h-16 mb-4 opacity-20" />
            <p>Select a conversation to start chatting</p>
          </div>
        )}
      </div>
    </div>
  )
}
