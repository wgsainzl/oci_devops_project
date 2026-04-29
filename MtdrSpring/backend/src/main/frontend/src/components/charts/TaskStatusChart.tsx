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
  LabelList,
  Cell // <-- 1. Import Cell to color individual bars
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

const nonZeroLabel = (value: number | string): number | string => (Number(value) > 0 ? value : '')

export default function TaskStatusChart({ data, showDeveloperNames = true }: Props): JSX.Element {
  
  // 2. INTERCEPT PERSONAL VIEW
  if (!showDeveloperNames) {
    // Transform the single developer's object into an array of statuses
    const userStats = data[0] || { todo: 0, inProgress: 0, inReview: 0, blocked: 0, done: 0 };
    
    const personalData = [
      { name: 'To do', value: userStats.todo, fill: '#b0b8c4' },
      { name: 'In progress', value: userStats.inProgress, fill: '#5aacbe' },
      { name: 'In review', value: userStats.inReview, fill: '#c4a86a' },
      // Optional: hide 'Blocked' if it's 0 to keep the chart cleaner, matching your mockup
      ...(userStats.blocked > 0 ? [{ name: 'Blocked', value: userStats.blocked, fill: '#e07b5a' }] : []),
      { name: 'Done', value: userStats.done, fill: '#5ba87a' }
    ];

    return (
      <ResponsiveContainer width="100%" height={240}>
        <BarChart 
          data={personalData} 
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          barCategoryGap="25%"
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#ede8df" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b6b6b' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#6b6b6b' }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
          
          {/* We only need one Bar element here, and we use Cell to map the colors */}
          <Bar dataKey="value" name="Tasks" radius={[3, 3, 0, 0]} maxBarSize={70}>
            {personalData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    )
  }

  // 3. FALLBACK TO TEAM VIEW (Your original code)
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart 
        data={data} 
        margin={{ top: 18, right: 10, left: -20, bottom: 18 }}
        barCategoryGap="20%"
        barGap={2}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#ede8df" vertical={false} />
        <XAxis
          dataKey="developer"
          tick={{ fontSize: 11, fill: '#6b6b6b' }}
          tickMargin={12}
          interval={0}
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
        
        <Bar dataKey="todo" name="To do" fill="#b0b8c4" radius={[3, 3, 0, 0]} maxBarSize={24}>
          <LabelList dataKey="todo" position="top" fill="#5f6772" fontSize={11} formatter={nonZeroLabel} />
        </Bar>
        <Bar dataKey="inProgress" name="In progress" fill="#5aacbe" radius={[3, 3, 0, 0]} maxBarSize={24}>
          <LabelList dataKey="inProgress" position="top" fill="#5f6772" fontSize={11} formatter={nonZeroLabel} />
        </Bar>
        <Bar dataKey="inReview" name="In review" fill="#c4a86a" radius={[3, 3, 0, 0]} maxBarSize={24}>
          <LabelList dataKey="inReview" position="top" fill="#5f6772" fontSize={11} formatter={nonZeroLabel} />
        </Bar>
        <Bar dataKey="blocked" name="Blocked" fill="#e07b5a" radius={[3, 3, 0, 0]} maxBarSize={24}>
          <LabelList dataKey="blocked" position="top" fill="#5f6772" fontSize={11} formatter={nonZeroLabel} />
        </Bar>
        <Bar dataKey="done" name="Done" fill="#5ba87a" radius={[3, 3, 0, 0]} maxBarSize={24}>
          <LabelList dataKey="done" position="top" fill="#5f6772" fontSize={11} formatter={nonZeroLabel} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}