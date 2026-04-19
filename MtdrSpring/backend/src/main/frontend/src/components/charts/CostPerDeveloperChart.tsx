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
} from "recharts";

// ── Types ─────────────────────────────────────────────────────────────────

export interface CostEntry {
  developer: string;
  [sprint: string]: string | number; // e.g. "Sprint 0": 1035, "Sprint 1": 675
}

interface Props {
  data: CostEntry[];
  sprints?: string[]; // e.g. ["Sprint 0", "Sprint 1"]
}

// ── Palette — matches your dashboard CSS vars ─────────────────────────────
const SPRINT_COLORS = ["#5aacbe", "#c74634", "#5ba87a", "#c4a86a", "#a07bc4"];

// ── Tooltip ───────────────────────────────────────────────────────────────
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
  return (
    <div
      style={{
        background: "white",
        border: "1px solid #e0d8cc",
        borderRadius: 6,
        padding: "8px 12px",
        fontSize: "0.8rem",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}
    >
      <p style={{ fontWeight: 600, marginBottom: 4 }}>{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color, margin: "2px 0" }}>
          {p.name}: <strong>${p.value.toLocaleString()}</strong>
        </p>
      ))}
    </div>
  );
};

// ── Placeholder data (replace with API call) ──────────────────────────────
export const COST_PLACEHOLDER: CostEntry[] = [
  { developer: "Sebastian", "Sprint 0": 1035, "Sprint 1": 675 },
  { developer: "Mauricio", "Sprint 0": 532, "Sprint 1": 494 },
  { developer: "Guillermo", "Sprint 0": 245, "Sprint 1": 595 },
  { developer: "Juan Manuel", "Sprint 0": 288, "Sprint 1": 256 },
  { developer: "Diego", "Sprint 0": 324, "Sprint 1": 252 },
];

// ── Component ─────────────────────────────────────────────────────────────
// ── Component ─────────────────────────────────────────────────────────────
export default function CostPerDeveloperChart({
  data = COST_PLACEHOLDER,
  sprints,
}: Props): JSX.Element {
  // Dynamically extract sprint names from the data keys if not provided, avoiding the 'developer' key
  const chartSprints =
    sprints ||
    (data.length > 0
      ? Object.keys(data[0]).filter((k) => k !== "developer")
      : []);

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart
        data={data}
        margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
        barCategoryGap="25%"
        barGap={3}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#ede8df"
          vertical={false}
        />
        <XAxis
          dataKey="developer"
          tick={{ fontSize: 11, fill: "#6b6b6b" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
          tick={{ fontSize: 11, fill: "#6b6b6b" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          content={<CustomTooltip />}
          cursor={{ fill: "rgba(0,0,0,0.04)" }}
        />
        <Legend
          iconType="square"
          iconSize={10}
          wrapperStyle={{ fontSize: "0.78rem", paddingTop: 8 }}
        />

        {chartSprints.map((sprint, i) => (
          <Bar
            key={sprint}
            dataKey={sprint}
            fill={SPRINT_COLORS[i % SPRINT_COLORS.length]}
            radius={[3, 3, 0, 0]}
            maxBarSize={32}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
