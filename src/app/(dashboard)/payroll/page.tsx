"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, Download, FileText, TrendingUp, ShieldCheck } from "lucide-react";
import { ThreeDPageHeader } from "@/components/ui/ThreeDPageHeader";
import { ThreeDCard } from "@/components/ui/ThreeDCard";

export default function Payroll() {
  return (
    <div className="space-y-6">
      <ThreeDPageHeader
        title="Payroll & Compensation"
        subtitle="Access salary disbursements, tax documents, and direct deposit statements."
        badge="Financial Engine"
        globeColor="#0EA5E9"
      />

      <div className="grid gap-6 md:grid-cols-2">
        <ThreeDCard glowColor="blue">
          <div className="flex items-center justify-between pb-3">
            <span className="text-xs font-mono uppercase text-muted-foreground tracking-wider font-semibold">Next Scheduled Disbursement</span>
            <div className="p-2.5 rounded-xl bg-blue-600/15 border border-blue-500/30 text-blue-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-white tracking-tight">October 31, 2026</div>
          <p className="text-xs text-sky-400 font-mono mt-1">Pay Period: Oct 16 - Oct 31 • Direct Deposit Active</p>
        </ThreeDCard>

        <ThreeDCard glowColor="emerald">
          <div className="flex items-center justify-between pb-3">
            <span className="text-xs font-mono uppercase text-muted-foreground tracking-wider font-semibold">YTD Gross Earnings</span>
            <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-white tracking-tight">$58,800.00</div>
          <p className="text-xs text-emerald-400 font-mono mt-1">Full-Time Compensation Mesh</p>
        </ThreeDCard>
      </div>

      <ThreeDCard glowColor="blue">
        <div className="p-2">
          <div className="mb-4 pb-3 border-b border-white/10 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-white uppercase">Recent Pay Stubs</h3>
              <p className="text-xs text-muted-foreground">Download verified digital payslips</p>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-blue-600/20 text-blue-300 text-[10px] font-mono border border-blue-500/30 font-bold">
              Encrypted PDF
            </span>
          </div>

          <div className="space-y-4">
            {[
              { date: "Oct 15, 2026", netPay: "$2,450.00", status: "Paid" },
              { date: "Sep 30, 2026", netPay: "$2,450.00", status: "Paid" },
              { date: "Sep 15, 2026", netPay: "$2,450.00", status: "Paid" },
            ].map((stub, i) => (
              <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:border-blue-500/40 transition-all duration-300 gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center shrink-0 text-blue-400">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-white text-sm">{stub.date}</div>
                    <div className="text-xs text-muted-foreground font-mono">Regular Direct Deposit</div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="font-black text-white text-base">{stub.netPay}</div>
                    <div className="text-[10px] text-emerald-400 font-mono font-bold uppercase tracking-wider">{stub.status}</div>
                  </div>
                  <Button variant="outline" size="icon" className="rounded-xl border-white/10 hover:bg-white/10 text-white">
                    <Download className="w-4 h-4" />
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
