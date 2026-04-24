import { type JSX } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  Cell,
} from "recharts";

// types

export interface HoursEntry {
  developer: string;
  estimated: number;
  actual: number;
}

interface Props {
  data: HoursEntry[];
}

// tooltip
interface TooltipPayloadItem {
  name: string;
  value: number;
  color: string;
}
interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: CustomTooltipProps): JSX.Element | null => {
  if (!active || !payload?.length) return null;
  const estimated = payload.find((p) => p.name === "Estimated")?.value ?? 0;
  const actual = payload.find((p) => p.name === "Actual")?.value ?? 0;
  const diff = actual - estimated;
  const over = diff > 0;

  return (
    <div
      style={{
        background: "white",
        border: "1px solid #e0d8cc",
        borderRadius: 6,
        padding: "8px 12px",
        fontSize: "0.8rem",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        minWidth: 140,
      }}
    >
      <p style={{ fontWeight: 600, marginBottom: 4 }}>{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color, margin: "2px 0" }}>
          {p.name}: <strong>{p.value}h</strong>
        </p>
      ))}
      {diff !== 0 && (
        <p
          style={{
            color: over ? "#c74634" : "#5ba87a",
            margin: "4px 0 0",
            fontWeight: 600,
          }}
        >
          {over ? `▲ ${diff}h over` : `▼ ${Math.abs(diff)}h under`}
        </p>
      )}
    </div>
  );
};

// ── Placeholder data ──────────────────────────────────────────────────────
export const HOURS_PLACEHOLDER: HoursEntry[] = [
  { developer: "Sebastian", estimated: 40, actual: 38 },
  { developer: "Mauricio", estimated: 40, actual: 36 },
  { developer: "Guillermo", estimated: 35, actual: 35 },
  { developer: "Juan Manuel", estimated: 32, actual: 32 },
  { developer: "Diego", estimated: 36, actual: 36 },
];

// ── Component ─────────────────────────────────────────────────────────────
export default function HoursChart({ data = HOURS_PLACEHOLDER }: Props): JSX.Element {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart
        data={data}
        margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
        barCategoryGap="25%"
        barGap={3}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#ede8df" vertical={false} />
        <XAxis
          dataKey="developer"
          tick={{ fontSize: 11, fill: "#6b6b6b" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={(v: number) => `${v}h`}
          tick={{ fontSize: 11, fill: "#6b6b6b" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,0.04)" }} />
        <Legend
          iconType="square"
          iconSize={10}
          wrapperStyle={{ fontSize: "0.78rem", paddingTop: 8 }}
        />
        <Bar
          dataKey="estimated"
          name="Estimated"
          fill="#5aacbe"
          radius={[3, 3, 0, 0]}
          maxBarSize={32}
        />
        <Bar dataKey="actual" name="Actual" radius={[3, 3, 0, 0]} maxBarSize={32}>
          {data.map((entry) => (
            <Cell
              key={entry.developer}
              // Red if over estimated, green if on track or under
              fill={entry.actual > entry.estimated ? "#c74634" : "#5ba87a"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
