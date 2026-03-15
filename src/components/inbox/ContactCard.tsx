'use client'

import { format } from 'date-fns'
import { User, Phone, Calendar } from 'lucide-react'

interface Contact {
  name: string
  phone_number: string
  user_type: 'guest' | 'owner' | 'investor'
  created_at: string
}

interface ContactCardProps {
  contact: Contact
}

export default function ContactCard({ contact }: ContactCardProps) {
  return (
    <div className="flex items-center justify-between px-6 py-4 bg-[#0F1117] border-b border-gray-800">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center">
          <User className="w-6 h-6 text-gray-400" />
        </div>
        <div>
          <h3 className="font-bold text-white">{contact.name || 'WhatsApp User'}</h3>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span className={`px-2 py-0.5 rounded text-white ${
              contact.user_type === 'guest' ? 'bg-blue-500' :
              contact.user_type === 'owner' ? 'bg-purple-500' : 'bg-amber-500'
            }`}>
              {contact.user_type}
            </span>
          </div>
        </div>
      </div>

      <div className="flex gap-6">
        <div className="flex flex-col items-center">
          <Phone className="w-4 h-4 text-gray-500 mb-1" />
          <span className="text-[10px] text-gray-400">{contact.phone_number}</span>
        </div>
        <div className="flex flex-col items-center">
          <Calendar className="w-4 h-4 text-gray-500 mb-1" />
          <span className="text-[10px] text-gray-400">
            Since {format(new Date(contact.created_at), 'MMM yyyy')}
          </span>
        </div>
      </div>
    </div>
  )
}
