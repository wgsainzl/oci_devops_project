import React, { type JSX } from 'react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts'

// types
export interface HoursEntry {
  developer: string
  estimated: number
  actual: number
}

interface Props {
  data: HoursEntry[]
}

// ── Data Transformation for Stacking ──
// We split the 'actual' value into 'actualOnTrack' (capped at estimated) 
// and 'actualOverflow' (anything above estimated)
function formatDataForStacking(data: HoursEntry[]) {
  return data.map((entry) => ({
    ...entry,
    actualOnTrack: Math.min(entry.actual, entry.estimated),
    actualOverflow: Math.max(0, entry.actual - entry.estimated)
  }))
}

// tooltip
interface TooltipPayloadItem {
  name: string
  value: number
  color: string
}
interface CustomTooltipProps {
  active?: boolean
  payload?: TooltipPayloadItem[]
  label?: string
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps): JSX.Element | null => {
  if (!active || !payload?.length) return null
  
  // find raw values from payload
  const estimated = payload.find((p) => p.name === 'Estimated')?.value ?? 0
  const actualOnTrack = payload.find((p) => p.name === 'Actual (On Track)')?.value ?? 0
  const actualOverflow = payload.find((p) => p.name === 'Actual (Over)')?.value ?? 0
  const totalActual = actualOnTrack + actualOverflow
  
  const diff = totalActual - estimated
  const over = diff > 0

  return (
    <div style={{
      background: 'white',
      border: '1px solid #e0d8cc',
      borderRadius: 6,
      padding: '8px 12px',
      fontSize: '0.8rem',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      minWidth: 140,
    }}>
      <p style={{ fontWeight: 600, marginBottom: 4 }}>{label}</p>
      <p style={{ color: '#5aacbe', margin: '2px 0' }}>
        Estimated: <strong>{estimated}h</strong>
      </p>
      <p style={{ color: '#5ba87a', margin: '2px 0' }}>
        Actual: <strong>{totalActual}h</strong>
      </p>
      
      {diff !== 0 && (
        <p style={{ color: over ? '#c74634' : '#5ba87a', margin: '4px 0 0', fontWeight: 600 }}>
          {over ? `▲ ${diff.toFixed(1)}h over` : `▼ ${Math.abs(diff).toFixed(1)}h under`}
        </p>
      )}
    </div>
  )
}


// hours chart
export default function HoursChart({ data }: Props): JSX.Element {
  const stackedData = formatDataForStacking(data)

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart
        data={stackedData}
        margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
        barCategoryGap="25%"
        barGap={3}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#ede8df" vertical={false} />
        <XAxis
          dataKey="developer"
          tick={{ fontSize: 11, fill: '#6b6b6b' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={(v: number) => `${v}h`}
          tick={{ fontSize: 11, fill: '#6b6b6b' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
        <Legend
          iconType="square"
          iconSize={10}
          wrapperStyle={{ fontSize: '0.78rem', paddingTop: 8 }}
          formatter={(value) => {
            if (value === 'Actual (On Track)') return 'Actual'
            if (value === 'Actual (Over)') return 'Over Estimate'
            return value
          }}
        />
        
        {/* estimated Bar */}
        <Bar dataKey="estimated" name="Estimated" fill="#5aacbe" radius={[3, 3, 0, 0]} maxBarSize={32} />
        
        {/* stacked bars */}
        {/* use stackId="a" to group them together */}
        <Bar dataKey="actualOnTrack" stackId="a" name="Actual (On Track)" fill="#5ba87a" radius={[0, 0, 0, 0]} maxBarSize={32} />
        <Bar dataKey="actualOverflow" stackId="a" name="Actual (Over)" fill="#c74634" radius={[3, 3, 0, 0]} maxBarSize={32} />
        
      </BarChart>
    </ResponsiveContainer>
  )
}
