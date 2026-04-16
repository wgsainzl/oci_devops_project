import { type JSX } from 'react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts'
import type { TaskStatusEntry } from '../../types'

interface Props {
  data: TaskStatusEntry[]
}

const BAR_COLOR_MAP: Record<string, string> = {
  'To do':       '#b0b8c4',
  'In progress': '#5aacbe',
  'In review':   '#c4a86a',
  'Done':        '#5ba87a',
}

interface TooltipPayloadItem {
  value: number
}

interface CustomTooltipProps {
  active?: boolean
  payload?: TooltipPayloadItem[]
  label?: string
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps): JSX.Element | null => {
  if (!active || !payload?.length) return null
  return (
    <div
      style={{
        background: 'white',
        border: '1px solid #e0d8cc',
        borderRadius: 6,
        padding: '6px 12px',
        fontSize: '0.8rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}
    >
      <strong>{label}</strong>: {payload[0].value}
    </div>
  )
}

export default function TaskStatusChart({ data }: Props): JSX.Element {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: '#6b6b6b' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#6b6b6b' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
        <Bar dataKey="count" radius={[3, 3, 0, 0]} maxBarSize={48}>
          {data.map((entry) => (
            <Cell
              key={entry.label}
              fill={BAR_COLOR_MAP[entry.label] ?? '#5aacbe'}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
