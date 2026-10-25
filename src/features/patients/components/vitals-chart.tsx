"use client";

import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { VitalSign } from "@/types/clinical";

interface VitalsChartProps {
  vitals: VitalSign[];
}

export function VitalsChart({ vitals }: VitalsChartProps) {
  if (!vitals || vitals.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-xs text-slate-400">
        No vital sign trend data recorded.
      </div>
    );
  }

  // Format data chronological for chart display
  const chartData = [...vitals]
    .reverse()
    .map((v) => ({
      time: new Date(v.recordedAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      heartRate: v.heartRate,
      systolic: v.systolicBP,
      diastolic: v.diastolicBP,
      spo2: v.oxygenSaturation,
    }));

  return (
    <div className="h-56 w-full pt-2">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 10, fill: "#64748b" }}
            stroke="#cbd5e1"
          />
          <YAxis
            domain={[40, 180]}
            tick={{ fontSize: 10, fill: "#64748b" }}
            stroke="#cbd5e1"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--shell-bg-deep)",
              borderColor: "var(--shell-border)",
              borderRadius: "6px",
              color: "#f8fafc",
              fontSize: "11px",
            }}
          />
          <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "6px" }} />
          <Line
            type="monotone"
            dataKey="heartRate"
            name="Heart Rate (BPM)"
            stroke="#dc2626"
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="systolic"
            name="Systolic BP"
            stroke="#0284c7"
            strokeWidth={1.8}
            dot={{ r: 2 }}
          />
          <Line
            type="monotone"
            dataKey="diastolic"
            name="Diastolic BP"
            stroke="#6366f1"
            strokeWidth={1.8}
            dot={{ r: 2 }}
          />
          <Line
            type="monotone"
            dataKey="spo2"
            name="SpO2 (%)"
            stroke="#16a34a"
            strokeWidth={1.8}
            dot={{ r: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
