import { type JSX } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import type { SprintVelocityEntry } from "../../types";

interface Props {
  data: SprintVelocityEntry[];
}

interface TooltipPayloadItem {
  name: string;
  value: number;
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: number;
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
      <p style={{ marginBottom: 4, fontWeight: 600 }}>Iteration {label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color, margin: 0 }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

export default function SprintVelocityChart({ data }: Props): JSX.Element {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#ede8df" />
        <XAxis
          dataKey="iteration"
          label={{
            value: "Iteration",
            position: "insideBottom",
            offset: -2,
            fontSize: 10,
            fill: "#9a9a9a",
          }}
          tick={{ fontSize: 11, fill: "#6b6b6b" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          label={{
            value: "Velocity",
            angle: -90,
            position: "insideLeft",
            offset: 15,
            fontSize: 10,
            fill: "#9a9a9a",
          }}
          tick={{ fontSize: 11, fill: "#6b6b6b" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: "0.78rem", paddingTop: 8 }}
        />
        <Line
          type="monotone"
          dataKey="estimated"
          name="Estimated"
          stroke="#5aacbe"
          strokeWidth={2}
          dot={{ r: 4, fill: "#5aacbe" }}
          activeDot={{ r: 5 }}
        />
        <Line
          type="monotone"
          dataKey="actual"
          name="Actual"
          stroke="#c74634"
          strokeWidth={2}
          dot={{ r: 4, fill: "#c74634" }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
