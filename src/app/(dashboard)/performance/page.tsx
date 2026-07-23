"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Target, MessageSquare, Award, ChevronRight, BarChart3, Plus, TrendingUp } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ThreeDPageHeader } from "@/components/ui/ThreeDPageHeader";
import { ThreeDCard } from "@/components/ui/ThreeDCard";

export default function Performance() {
  return (
    <div className="space-y-6">
      <ThreeDPageHeader
        title="Performance Analytics"
        subtitle="Track goals, complete reviews, and provide continuous 3D telemetry feedback."
        badge="Growth Mesh"
      >
        <div className="flex gap-2">
          <Button className="bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-[0_0_20px_rgba(37,99,235,0.4)] rounded-2xl text-xs uppercase tracking-wider border border-blue-400/40 h-11 px-5">
            <Target className="mr-2 h-4 w-4" /> New Goal
          </Button>
        </div>
      </ThreeDPageHeader>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <ThreeDCard glowColor="blue">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-mono uppercase text-muted-foreground font-semibold">Active Goals</span>
            <Target className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">4 Goals</div>
          <p className="text-xs text-sky-400 font-mono mt-1">2 on track • 2 behind schedule</p>
        </ThreeDCard>

        <ThreeDCard glowColor="cyan">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-mono uppercase text-muted-foreground font-semibold">Pending Reviews</span>
            <MessageSquare className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">1 Pending</div>
          <p className="text-xs text-sky-300 font-mono mt-1">Self review due in 3 days</p>
        </ThreeDCard>

        <ThreeDCard glowColor="emerald">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-mono uppercase text-muted-foreground font-semibold">Feedback Score</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-white">4.9 / 5.0</div>
          <p className="text-xs text-emerald-400 font-mono mt-1">+0.3 rating increase</p>
        </ThreeDCard>

        <ThreeDCard glowColor="white">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-mono uppercase text-muted-foreground font-semibold">Overall Rating</span>
            <BarChart3 className="w-4 h-4 text-white" />
          </div>
          <div className="text-3xl font-extrabold text-white">Exceeds</div>
          <p className="text-xs text-gray-400 font-mono mt-1">Q3 2026 Evaluation</p>
        </ThreeDCard>
      </div>

      <ThreeDCard glowColor="blue">
        <div className="p-2">
          <h3 className="text-lg font-black text-white uppercase mb-1">Quarterly Objectives (OKRs)</h3>
          <p className="text-xs text-muted-foreground mb-6">Real-time goal progress & target milestone tracking</p>

          <div className="space-y-4">
            {[
              { title: "Optimize HRIS System Latency < 100ms", progress: 85, color: "bg-blue-500" },
              { title: "Deploy AI Autonomous Recruitment Mesh", progress: 95, color: "bg-sky-400" },
              { title: "Complete Q4 Engineering Leadership Reviews", progress: 60, color: "bg-emerald-400" },
            ].map((goal, i) => (
              <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white">{goal.title}</span>
                  <span className="text-xs font-mono text-sky-400 font-bold">{goal.progress}%</span>
                </div>
                <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden">
                  <div className={`h-full ${goal.color} rounded-full transition-all duration-500`} style={{ width: `${goal.progress}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </ThreeDCard>
    </div>
  );
}
