'use client'

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend 
} from 'recharts'

interface ActivityChartProps {
  data: {
    name: string
    inbound: number
    outbound: number
  }[]
}

export default function ActivityChart({ data }: ActivityChartProps) {
  return (
    <div className="h-[300px] w-full bg-secondary/10 border border-gray-800 rounded-xl p-6">
      <h3 className="text-sm font-semibold text-gray-400 uppercase mb-6">Activity (Last 7 Days)</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
          <XAxis 
            dataKey="name" 
            stroke="#6B7280" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false}
          />
          <YAxis 
            stroke="#6B7280" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1A1D2E', 
              border: '1px solid #374151',
              borderRadius: '8px',
              fontSize: '12px'
            }}
            cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
          />
          <Legend 
            verticalAlign="top" 
            align="right" 
            iconType="circle"
            wrapperStyle={{ paddingBottom: '20px', fontSize: '12px' }}
          />
          <Bar 
            name="Inbound" 
            dataKey="inbound" 
            fill="#1D9E75" 
            radius={[4, 4, 0, 0]} 
            barSize={20}
          />
          <Bar 
            name="Outbound" 
            dataKey="outbound" 
            fill="#534AB7" 
            radius={[4, 4, 0, 0]} 
            barSize={20}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
