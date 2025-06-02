import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Line,
  Cell,
  CartesianGrid
} from "recharts";

const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function BPMChart({ bpmData }) {
  const validBPMs = bpmData.filter((v) => v !== null && v !== undefined);
  const averageBPM = validBPMs.length > 0
    ? Math.round(validBPMs.reduce((sum, val) => sum + val, 0) / validBPMs.length)
    : 0;

  const data = weekdays.map((day, index) => {
    const bpm = bpmData[index];
    const isFilled = bpm !== null && bpm !== undefined;
    return {
      day,
      bpm: isFilled ? bpm : averageBPM,
      isFilled
    };
  });

  return (
    <ResponsiveContainer width="100%" height={290}>
      <BarChart
        data={data}
        barCategoryGap={20}
        margin={{ top: 20, right: 20, left: 10, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="day" tick={{ fontSize: 12 }} />
        <YAxis domain={[0, 150]} tick={{ fontSize: 12 }} />
        <Tooltip
          formatter={(value, name) => [`${value} BPM`, name]}
          contentStyle={{
            fontSize: "13px",
            borderRadius: "10px",
            backgroundColor: "#fff",
            border: "1px solid #eee",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            padding: "10px"
          }}
          cursor={false}
        />

        <Bar dataKey="bpm" barSize={28} radius={[30, 30, 30, 30]}>
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.isFilled ? "#e74c3c" : "#bbb"}
              opacity={entry.isFilled ? 1 : 0.4}
            />
          ))}
        </Bar>

        <Line
          type="monotone"
          dataKey="bpm"
          stroke="#3f51b5"
          strokeWidth={2}
          dot={(props) =>
            data[props.index].isFilled ? (
              <circle {...props} r={4} fill="#3f51b5" />
            ) : null
          }
          activeDot={{ r: 6 }}
          connectNulls
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

export default BPMChart;
