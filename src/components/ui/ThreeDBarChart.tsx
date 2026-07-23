"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Activity, TrendingUp, Cpu } from "lucide-react";

interface BarData {
  label: string;
  value: number;
  color: string;
  change: string;
}

const defaultData: BarData[] = [
  { label: "Mon", value: 92, color: "from-blue-600 to-blue-400", change: "+4%" },
  { label: "Tue", value: 98, color: "from-sky-500 to-cyan-300", change: "+6%" },
  { label: "Wed", value: 95, color: "from-blue-500 to-indigo-400", change: "+3%" },
  { label: "Thu", value: 89, color: "from-blue-700 to-blue-500", change: "-1%" },
  { label: "Fri", value: 97, color: "from-sky-400 to-blue-500", change: "+5%" },
  { label: "Sat", value: 84, color: "from-slate-600 to-slate-400", change: "Weekend" },
  { label: "Sun", value: 88, color: "from-slate-600 to-slate-400", change: "Weekend" },
];

export function ThreeDBarChart() {
  const [activeBar, setActiveBar] = useState<number | null>(1);

  return (
    <div className="relative p-6 rounded-2xl bg-[#0B0F19]/80 border border-blue-500/30 backdrop-blur-xl shadow-2xl overflow-hidden group">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-600/20 text-blue-300 border border-blue-500/40 text-[10px] font-mono uppercase font-bold">
              3D AI Telemetry
            </span>
            <span className="text-[11px] font-mono text-sky-400 flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-sky-400 animate-pulse" /> Live Attendance Rate
            </span>
          </div>
          <h3 className="text-xl font-extrabold text-white tracking-tight uppercase">
            Workforce Efficiency Index
          </h3>
        </div>

        <div className="text-right">
          <span className="text-2xl font-black text-white">95.4%</span>
          <span className="text-xs text-emerald-400 font-mono flex items-center justify-end gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> +2.8% vs last week
          </span>
        </div>
      </div>

      {/* 3D Bar Chart Visualizer */}
      <div className="h-48 pt-6 pb-2 flex items-end justify-between gap-3 relative z-10 [perspective:800px]">
        {defaultData.map((bar, idx) => {
          const isSelected = activeBar === idx;
          return (
            <div
              key={bar.label}
              onMouseEnter={() => setActiveBar(idx)}
              className="flex-1 flex flex-col items-center gap-2 cursor-pointer group/bar h-full justify-end"
            >
              {/* Tooltip on hover */}
              {isSelected && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className="mb-1 px-2 py-1 rounded-lg bg-blue-600 text-white font-mono text-[10px] font-bold shadow-lg border border-blue-400 shrink-0"
                >
                  {bar.value}% ({bar.change})
                </motion.div>
              )}

              {/* 3D Bar Element */}
              <div className="w-full relative h-36 flex items-end justify-center">
                <motion.div
                  initial={{ height: "0%" }}
                  animate={{ height: `${bar.value}%` }}
                  transition={{ duration: 0.8, delay: idx * 0.08 }}
                  className={`w-full max-w-[36px] rounded-t-xl bg-gradient-to-t ${bar.color} relative transition-all duration-300 shadow-[0_0_15px_rgba(37,99,235,0.3)] group-hover/bar:shadow-[0_0_25px_rgba(56,189,248,0.6)] ${
                    isSelected ? "scale-105 ring-2 ring-sky-400 brightness-125" : ""
                  }`}
                  style={{
                    transformStyle: "preserve-3d",
                    transform: isSelected ? "translateZ(15px)" : "translateZ(0px)",
                  }}
                >
                  {/* Top glowing cap */}
                  <div className="absolute top-0 left-0 right-0 h-1.5 rounded-t-xl bg-white/60 backdrop-blur-xs" />
                </motion.div>
              </div>

              {/* Label */}
              <span className={`text-[11px] font-mono font-bold transition-colors ${isSelected ? "text-sky-300" : "text-muted-foreground"}`}>
                {bar.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Footer telemetry status */}
      <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-muted-foreground">
        <span className="flex items-center gap-1.5 text-blue-400">
          <Cpu className="w-3.5 h-3.5" /> Neural Mesh Analytics v4.8
        </span>
        <span className="text-gray-400">Updated Real-Time</span>
      </div>
    </div>
  );
}
