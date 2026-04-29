import { type JSX } from 'react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts'
import type { SprintVelocityEntry } from '../../types'
import styles from './SprintVelocityChart.module.css'

interface Props {
  data: SprintVelocityEntry[]
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
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  )
}

export default function SprintVelocityChart({ data }: Props): JSX.Element {
  // Ordenar cronológicamente (Backlog primero, luego por número de Sprint)
  const sortedData = [...data].sort((a: any, b: any) => {
    const nameA = String(a.sprintName || '');
    const nameB = String(b.sprintName || '');

    if (nameA.toLowerCase() === 'backlog') return -1;
    if (nameB.toLowerCase() === 'backlog') return 1;

    const numA = parseInt(nameA.match(/\d+/)?.[0] || '0', 10);
    const numB = parseInt(nameB.match(/\d+/)?.[0] || '0', 10);

    return numA - numB;
  });

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={sortedData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#ede8df" />
        <XAxis
          dataKey="sprintName"
          label={{
            value: 'Sprint',
            position: 'insideBottom',
            offset: -2,
            fontSize: 10,
            fill: '#9a9a9a',
          }}
          tick={{ fontSize: 11, fill: '#6b6b6b' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          label={{
            value: 'Velocity',
            angle: -90,
            position: 'insideLeft',
            offset: 15,
            fontSize: 10,
            fill: '#9a9a9a',
          }}
          tick={{ fontSize: 11, fill: '#6b6b6b' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: '0.78rem', paddingTop: 8 }}
        />
        <Line
          type="monotone"
          dataKey="estimated"
          name="Estimated"
          stroke="#5aacbe"
          strokeWidth={2}
          dot={{ r: 4, fill: '#5aacbe' }}
          activeDot={{ r: 5 }}
        />
        <Line
          type="monotone"
          dataKey="actual"
          name="Actual"
          stroke="#c74634"
          strokeWidth={2}
          dot={{ r: 4, fill: '#c74634' }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}