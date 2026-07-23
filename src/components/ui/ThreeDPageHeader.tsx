"use client";

import React from "react";
import { motion } from "framer-motion";
import { ThreeDInteractiveGlobe } from "@/components/ui/ThreeDInteractiveGlobe";
import { Activity, Sparkles } from "lucide-react";

interface ThreeDPageHeaderProps {
  title: string;
  subtitle: string;
  badge?: string;
  children?: React.ReactNode;
  globeColor?: string;
}

export function ThreeDPageHeader({
  title,
  subtitle,
  badge = "Three Dine Mesh",
  children,
  globeColor = "#2563eb",
}: ThreeDPageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mb-8 p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-blue-950/80 via-[#0B0F19] to-sky-950/60 border border-blue-500/35 backdrop-blur-2xl relative overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,0.6)] flex flex-col md:flex-row md:items-center justify-between gap-6"
    >
      {/* Top ambient glowing spot */}
      <div className="absolute top-0 right-1/4 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="space-y-1.5 relative z-10">
        <div className="flex items-center gap-2">
          <span className="px-3 py-0.5 rounded-full bg-blue-600/20 border border-blue-500/40 text-blue-300 text-[10px] font-mono uppercase tracking-wider font-extrabold shadow-sm flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-blue-400" />
            {badge}
          </span>
          <span className="text-xs text-sky-400 font-mono flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 text-sky-400 animate-pulse" /> Live Telemetry
          </span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white uppercase">
          {title}
        </h1>

        <p className="text-xs sm:text-sm text-muted-foreground max-w-xl">
          {subtitle}
        </p>
      </div>

      <div className="flex items-center gap-4 relative z-10 shrink-0">
        {/* Interactive 3D WebGL Torus Widget */}
        <ThreeDInteractiveGlobe size={85} color={globeColor} />
        {children}
      </div>
    </motion.div>
  );
}
