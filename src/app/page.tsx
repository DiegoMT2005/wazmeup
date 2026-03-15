import Link from 'next/link'
import { Rocket, Shield, MessageCircle, BarChart3, ArrowRight } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0F1117] text-white selection:bg-primary/30">
      <main className="max-w-7xl mx-auto px-6 py-20 lg:py-32">
        <div className="flex flex-col items-center text-center space-y-12">
          {/* Hero Section */}
          <div className="space-y-6 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-primary text-sm font-bold animate-bounce mt-10">
              <Rocket className="w-4 h-4" />
              <span>Phase 1 MVP Live</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight bg-gradient-to-r from-white via-primary to-primary-dark bg-clip-text text-transparent">
              WazMeUp: Automated Guest Hospitality
            </h1>
            <p className="text-xl text-gray-400 leading-relaxed">
              The premium WhatsApp-first concierge for modern property management. 
              Automate guest flows, engage owners with reports, and manage everything in real-time.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 pt-8">
            <Link 
              href="/dashboard" 
              className="px-8 py-4 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold text-lg transition-all shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              Enter Dashboard <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              href="/onboarding" 
              className="px-8 py-4 bg-gray-900 hover:bg-gray-800 border border-gray-800 text-white rounded-xl font-bold text-lg transition-all"
            >
              Setup New Property
            </Link>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-20 w-full">
            <FeatureCard 
              icon={<MessageCircle className="text-primary w-8 h-8" />}
              title="Intelligent Flows"
              description="Native WhatsApp interactive flows for check-in, maintenance, and feedback."
            />
            <FeatureCard 
              icon={<Shield className="text-purple-500 w-8 h-8" />}
              title="Human Takeover"
              description="Staff can seamlessly jump into any bot conversation when a personal touch is needed."
            />
            <FeatureCard 
              icon={<BarChart3 className="text-green-500 w-8 h-8" />}
              title="Owner Reports"
              description="Weekly performance summaries sent directly to owners via automated WhatsApp messages."
            />
          </div>
        </div>
      </main>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-8 bg-secondary/10 border border-gray-800 rounded-2xl hover:bg-secondary/20 transition-all text-left space-y-4 group hover:border-primary/30">
      <div className="p-3 bg-gray-900 rounded-xl w-fit group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white">{title}</h3>
      <p className="text-gray-400 leading-relaxed text-sm">
        {description}
      </p>
    </div>
  )
}
