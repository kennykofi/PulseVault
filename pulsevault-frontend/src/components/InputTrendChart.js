import React from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Area
} from "recharts";

const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function InputTrendChart({ bpmData }) {
  const data = weekdays.map((day, index) => ({
    day,
    bpm: bpmData[index],
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
        <XAxis dataKey="day" tick={{ fontSize: 12 }} />
        <YAxis domain={[0, 150]} tick={{ fontSize: 12 }} />
        <Tooltip
          formatter={(value) => (value ? `${value} BPM` : "No data")}
          contentStyle={{
            fontSize: "13px",
            borderRadius: "10px",
            backgroundColor: "#ffffff",
            border: "1px solid #eee",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            padding: "10px"
          }}
        />
        {/* Optional background area */}
        <Area
          type="basis"
          dataKey="bpm"
          stroke="none"
          fill="rgba(236, 112, 99, 0.15)"
          isAnimationActive={true}
        />
        <Line
          type="basis"
          dataKey="bpm"
          stroke="#e74c3c"
          strokeWidth={3}
          dot={{ r: 5, stroke: "#fff", strokeWidth: 2, fill: "#e74c3c" }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default InputTrendChart;
