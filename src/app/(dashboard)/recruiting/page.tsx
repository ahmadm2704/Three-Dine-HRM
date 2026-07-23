"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, Users, Plus, ChevronRight, UserCheck } from "lucide-react";
import { ThreeDPageHeader } from "@/components/ui/ThreeDPageHeader";
import { ThreeDCard } from "@/components/ui/ThreeDCard";

export default function Recruiting() {
  return (
    <div className="space-y-6">
      <ThreeDPageHeader
        title="Recruiting & ATS Pipeline"
        subtitle="Manage job requisitions, track active candidate pipelines, and schedule AI interviews."
        badge="Talent Acquisition"
      >
        <Button className="bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-[0_0_20px_rgba(37,99,235,0.4)] rounded-2xl text-xs uppercase tracking-wider border border-blue-400/40 h-11 px-5">
          <Plus className="mr-2 h-4 w-4" /> New Requisition
        </Button>
      </ThreeDPageHeader>

      <div className="grid gap-6 md:grid-cols-3">
        <ThreeDCard glowColor="blue">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-mono uppercase text-muted-foreground font-semibold">Open Requisitions</span>
            <Briefcase className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-3xl font-black text-white">5 Active Jobs</div>
          <p className="text-xs text-sky-400 font-mono mt-1">Across Technology & Research</p>
        </ThreeDCard>

        <ThreeDCard glowColor="cyan">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-mono uppercase text-muted-foreground font-semibold">Active Candidates</span>
            <Users className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-3xl font-black text-white">42 Applicants</div>
          <p className="text-xs text-sky-300 font-mono mt-1">In review & interview stage</p>
        </ThreeDCard>

        <ThreeDCard glowColor="emerald">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-mono uppercase text-muted-foreground font-semibold">Offers Extended</span>
            <UserCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-white">3 Pending Offers</div>
          <p className="text-xs text-emerald-400 font-mono mt-1">98% Offer Acceptance Rate</p>
        </ThreeDCard>
      </div>

      <ThreeDCard glowColor="blue">
        <div className="p-2">
          <h3 className="text-lg font-black text-white uppercase mb-1">Active Job Positions</h3>
          <p className="text-xs text-muted-foreground mb-6">Open requisitions and candidate telemetry</p>

          <div className="space-y-4">
            {[
              { title: "Senior AI Software Engineer", dept: "Three Dine Technology", stage: "Interviewing", candidates: 18 },
              { title: "Machine Learning Researcher", dept: "Three Dine Research", stage: "Technical Evaluation", candidates: 14 },
              { title: "Senior Product Designer", dept: "Design Division", stage: "Offer Extended", candidates: 3 },
            ].map((job, i) => (
              <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:border-blue-500/40 transition-all duration-300 gap-4">
                <div>
                  <h4 className="font-bold text-white text-sm">{job.title}</h4>
                  <p className="text-xs text-sky-400 font-mono">{job.dept}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="px-3 py-1 rounded-full bg-blue-600/20 text-blue-300 border border-blue-500/40 text-xs font-mono font-bold">
                    {job.stage}
                  </span>
                  <span className="text-xs font-mono text-muted-foreground">{job.candidates} candidates</span>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white">
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </ThreeDCard>
    </div>
  );
}
