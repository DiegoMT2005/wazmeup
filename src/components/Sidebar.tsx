import Link from 'next/link'

import { 
  LayoutDashboard, 
  Building2, 
  MessageSquare, 
  GitBranch, 
  BarChart3, 
  Settings 
} from 'lucide-react'

const navLinks = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Properties', href: '/properties', icon: Building2 },
  { name: 'Conversations', href: '/conversations', icon: MessageSquare },
  { name: 'Flow Builder', href: '/flow-builder', icon: GitBranch },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export default function Sidebar() {
  return (
    <div className="flex h-screen w-64 flex-col bg-[#0F1117] border-r border-gray-800">
      <div className="flex h-16 items-center px-6">
        <span className="text-2xl font-bold text-primary">WazMeUp</span>
      </div>
      <nav className="flex-1 space-y-1 px-4 py-4">
        {navLinks.map((link) => (
          <Link
            key={link.name}
            href={link.href}
            className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white rounded-lg transition-all group"
          >
            <link.icon className="w-4 h-4 text-gray-500 group-hover:text-primary transition-colors" />
            {link.name}
          </Link>
        ))}
      </nav>
    </div>
  )
}
