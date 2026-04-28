import { type JSX } from 'react'
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
import type { TaskStatusEntry } from '../../types'
import styles from './TaskStatusChart.module.css'

interface Props {
  data: TaskStatusEntry[]
  showDeveloperNames?: boolean
}

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
  return (
    <div className={styles.tooltip}>
      <p className={styles.tooltipTitle}>{label}</p>
      {payload.map((p) => (
        <p key={p.name} className={styles.tooltipItem} style={{ color: p.color }}>
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  )
}

export default function TaskStatusChart({ data, showDeveloperNames = true }: Props): JSX.Element {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart 
        data={data} 
        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        barCategoryGap="20%"
        barGap={2}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#ede8df" vertical={false} />
        <XAxis
          dataKey="developer"
          tick={showDeveloperNames ? { fontSize: 11, fill: '#6b6b6b' } : false}
          interval={showDeveloperNames ? 0 : 'preserveEnd'}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#6b6b6b' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
        <Legend
          iconType="square"
          iconSize={10}
          wrapperStyle={{ fontSize: '0.78rem', paddingTop: 8 }}
        />
        
        <Bar dataKey="todo" name="To do" fill="#b0b8c4" radius={[3, 3, 0, 0]} maxBarSize={24} />
        <Bar dataKey="inProgress" name="In progress" fill="#5aacbe" radius={[3, 3, 0, 0]} maxBarSize={24} />
        <Bar dataKey="inReview" name="In review" fill="#c4a86a" radius={[3, 3, 0, 0]} maxBarSize={24} />
        <Bar dataKey="blocked" name="Blocked" fill="#e07b5a" radius={[3, 3, 0, 0]} maxBarSize={24} />
        <Bar dataKey="done" name="Done" fill="#5ba87a" radius={[3, 3, 0, 0]} maxBarSize={24} />
      </BarChart>
    </ResponsiveContainer>
  )
}
