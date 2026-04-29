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
  LabelList,
} from 'recharts'
import styles from './CostPerDeveloperChart.module.css'

// ── Types ─────────────────────────────────────────────────────────────────

export interface CostEntry {
  developer: string
  [sprint: string]: string | number  // e.g. "Sprint 0": 1035, "Sprint 1": 675
}

interface Props {
  data: CostEntry[]
  sprints?: string[]  // e.g. ["Sprint 0", "Sprint 1"]
}

// ── Palette — matches your dashboard CSS vars ─────────────────────────────
const SPRINT_COLORS = ['#5aacbe', '#c74634', '#5ba87a', '#c4a86a', '#a07bc4']

// format labels with currency and hide zeros
const formatCostLabel = (value: number | string): string => {
  const num = Number(value)
  if (num === 0) return ''
  if (num >= 1000) return `${(num / 1000).toFixed(1).replace('.0', '')}k`
  return `${num}`
}

// ── Tooltip ───────────────────────────────────────────────────────────────
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
          {p.name}: <strong>${p.value.toLocaleString()}</strong>
        </p>
      ))}
    </div>
  )
}

// ── Component ─────────────────────────────────────────────────────────────
export default function CostPerDeveloperChart({
  data,
  sprints,
}: Props): JSX.Element {
  const sprintKeys = sprints ?? Object.keys(data[0] ?? {}).filter((key) => key !== 'developer')

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        margin={{ top: 35, right: 10, left: 10, bottom: 0 }}
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
          tickFormatter={(v: number) => {
            if (v >= 1000) return `$${(v / 1000).toFixed(1).replace('.0', '')}k`
            return `$${v}`
          }}
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
        {sprintKeys.map((sprint, i) => (
          <Bar
            key={sprint}
            dataKey={sprint}
            fill={SPRINT_COLORS[i % SPRINT_COLORS.length]}
            radius={[3, 3, 0, 0]}
            maxBarSize={32}
          >
            <LabelList 
              dataKey={sprint} 
              position="top" 
              fill="#5f6772" 
              fontSize={8}
              fontWeight={600}
              formatter={formatCostLabel}
              offset={4}
            />
          </Bar>
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}
