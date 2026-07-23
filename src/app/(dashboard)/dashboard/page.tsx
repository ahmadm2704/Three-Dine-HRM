"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ThreeDCard } from "@/components/ui/ThreeDCard";
import { ThreeDInteractiveGlobe } from "@/components/ui/ThreeDInteractiveGlobe";
import { ThreeDBarChart } from "@/components/ui/ThreeDBarChart";
import { supabase } from "@/lib/supabase";
import { 
  CalendarDays, 
  Clock, 
  FileText, 
  Target, 
  ChevronRight, 
  Award,
  Sparkles,
  Zap,
  TrendingUp,
  Activity,
  UserCheck,
  Bot,
  Code,
  Microscope,
  Users,
  ShieldCheck,
  Building,
  CheckCircle2,
  XCircle,
  Plus
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function Dashboard() {
  const router = useRouter();

  // User state
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<"super_admin" | "hr_admin" | "manager" | "employee">("employee");
  const [firstName, setFirstName] = useState("Team Member");
  
  // Dynamic metrics data state
  const [loading, setLoading] = useState(true);
  const [employeeCount, setEmployeeCount] = useState(0);
  const [pendingApprovals, setPendingApprovals] = useState(0);
  const [userPTOAvailable, setUserPTOAvailable] = useState(14);
  const [userPendingRequests, setUserPendingRequests] = useState(0);
  const [outToday, setOutToday] = useState<any[]>([]);
  const [departmentCount, setDepartmentCount] = useState(4);

  // Quick Action Modal State
  const [showActionModal, setShowActionModal] = useState(false);

  useEffect(() => {
    // 1. Parse user from localStorage
    const saved = localStorage.getItem("threedine_user");
    let currentUserId: string | null = null;
    let currentUserRole: any = "employee";

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setUser(parsed);
        if (parsed.firstName) setFirstName(parsed.firstName);
        if (parsed.role) {
          currentUserRole = parsed.role;
          setRole(parsed.role);
        }
        if (parsed.id) currentUserId = parsed.id;
      } catch (e) {}
    }

    // 2. Fetch live dynamic data from Supabase/APIs
    async function loadDynamicDashboardData() {
      setLoading(true);
      try {
        // Fetch total active employees
        const empRes = await fetch('/api/employees');
        if (empRes.ok) {
          const empData = await empRes.json();
          const emps = empData.employees || [];
          setEmployeeCount(emps.length);
        }

        // Fetch leave requests for metrics & "Who is out today"
        const { data: leaveData } = await supabase
          .from('time_off_requests')
          .select('*');

        if (leaveData) {
          // Count all pending approvals for admins/managers
          const pendingCount = leaveData.filter((r: any) => r.status === 'pending').length;
          setPendingApprovals(pendingCount);

          // Calculate current user's PTO balance & pending requests if logged in
          if (currentUserId) {
            const userRequests = leaveData.filter((r: any) => r.employee_id === currentUserId);
            const approvedPtoDays = userRequests
              .filter((r: any) => r.type === 'pto' && r.status === 'approved')
              .reduce((sum: number, r: any) => sum + (r.days_count || 1), 0);
            
            setUserPTOAvailable(Math.max(0, 20 - approvedPtoDays));
            setUserPendingRequests(userRequests.filter((r: any) => r.status === 'pending').length);
          }

          // Dynamic "Out Today" (approved leaves covering today)
          const todayStr = new Date().toISOString().split('T')[0];
          const activeLeaves = leaveData.filter((r: any) => 
            r.status === 'approved' && 
            r.start_date <= todayStr && 
            r.end_date >= todayStr
          );

          if (activeLeaves.length > 0) {
            setOutToday(activeLeaves.map((l: any) => ({
              name: l.employees?.first_name ? `${l.employees.first_name} ${l.employees.last_name}` : "Team Member",
              role: l.type ? `${l.type.toUpperCase()} Leave` : "On Leave",
              return: l.end_date || "Soon",
              status: l.type || "leave"
            })));
          } else {
            // Default fallback team out display
            setOutToday([]);
          }
        }
      } catch (err) {
        console.error("Error loading dynamic dashboard:", err);
      } finally {
        setLoading(false);
      }
    }

    loadDynamicDashboardData();
  }, []);

  const isAdmin = role === "super_admin" || role === "hr_admin" || role === "manager";

  // Dynamic next payday calculation (15th or last day of month)
  const today = new Date();
  const nextPaydayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() <= 15 ? 15 : new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate());
  const paydayFormatted = nextPaydayDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const daysUntilPayday = Math.max(1, Math.ceil((nextPaydayDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 pb-10"
    >
      {/* Dynamic Welcome Hero Banner */}
      <motion.div variants={itemVariants} className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-950/85 via-[#0A0D17] to-sky-950/65 border border-blue-500/40 backdrop-blur-2xl relative overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-6 relative z-10">
          {/* Seamless Transparent Logo */}
          <div className="relative shrink-0 hidden sm:block">
            <img 
              src="/logo-transparent.png" 
              alt="Three Dine Corporation" 
              className="h-12 sm:h-14 w-auto object-contain drop-shadow-[0_0_20px_rgba(37,99,235,0.6)]"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-0.5 rounded-full bg-blue-600/20 border border-blue-500/40 text-blue-300 text-[10px] font-mono uppercase tracking-wider font-extrabold shadow-sm">
                {isAdmin ? (role === 'super_admin' ? 'SUPER ADMIN ACTIVE' : 'ADMIN ACTIVE') : 'EMPLOYEE PORTAL'}
              </span>
              <span className="text-xs text-sky-400 font-mono flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-sky-400 animate-pulse" /> Where Research Meets Technology
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white uppercase">
              Good day, <span className="text-gradient-blue">{firstName}</span>!
            </h1>

            <p className="text-xs sm:text-sm text-muted-foreground max-w-xl">
              {isAdmin 
                ? "Enterprise HR control mesh, workforce telemetry, and personnel management suite." 
                : "Welcome to your Three Dine employee self-service portal and performance portal."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 relative z-10 shrink-0">
          {/* 3D WebGL Torus Mesh */}
          <ThreeDInteractiveGlobe size={100} color={isAdmin ? "#2563eb" : "#38bdf8"} />

          <Button 
            onClick={() => setShowActionModal(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white font-extrabold shadow-[0_0_25px_rgba(37,99,235,0.5)] rounded-2xl text-xs uppercase tracking-wider border border-blue-400/40 h-12 px-5"
          >
            <Zap className="w-4 h-4 mr-2 fill-white" /> Quick Actions
          </Button>
        </div>
      </motion.div>

      {/* Role-Based Dynamic Metric Cards Grid */}
      <motion.div variants={itemVariants} className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {isAdmin ? (
          <>
            {/* Admin Metric 1: Total Workforce */}
            <ThreeDCard glowColor="blue" intensity={15} onClick={() => router.push("/directory")}>
              <div className="flex items-center justify-between pb-3">
                <span className="text-xs font-mono uppercase text-muted-foreground tracking-wider font-semibold">Total Personnel</span>
                <div className="p-2.5 rounded-xl bg-blue-600/15 border border-blue-500/30 text-blue-400">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-black text-white tracking-tight">{employeeCount || 24} Staff</div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 mt-1 font-mono">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Active Employee Directory</span>
              </div>
              <Button variant="link" className="p-0 h-auto mt-4 text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1">
                View Directory <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </ThreeDCard>

            {/* Admin Metric 2: Pending Leave Approvals */}
            <ThreeDCard glowColor="cyan" intensity={15} onClick={() => router.push("/time-off")}>
              <div className="flex items-center justify-between pb-3">
                <span className="text-xs font-mono uppercase text-muted-foreground tracking-wider font-semibold">Pending Approvals</span>
                <div className="p-2.5 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-400">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-black text-white tracking-tight">{pendingApprovals} Pending</div>
              <p className="text-xs text-sky-400 mt-1 font-mono">Leave requests requiring review</p>
              <Button variant="link" className="p-0 h-auto mt-4 text-xs text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1">
                Review Leaves <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </ThreeDCard>

            {/* Admin Metric 3: Next Corporate Payday */}
            <ThreeDCard glowColor="white" intensity={15} onClick={() => router.push("/payroll")}>
              <div className="flex items-center justify-between pb-3">
                <span className="text-xs font-mono uppercase text-muted-foreground tracking-wider font-semibold">Next Disbursement</span>
                <div className="p-2.5 rounded-xl bg-white/10 border border-white/20 text-white">
                  <CalendarDays className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-black text-white tracking-tight">{paydayFormatted}</div>
              <p className="text-xs text-muted-foreground mt-1 font-mono">Disbursement in {daysUntilPayday} days</p>
              <Button variant="link" className="p-0 h-auto mt-4 text-xs text-white hover:text-gray-300 font-semibold flex items-center gap-1">
                Manage Payroll <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </ThreeDCard>

            {/* Admin Metric 4: System Roles & Control */}
            <ThreeDCard glowColor="emerald" intensity={15} onClick={() => router.push("/admin")}>
              <div className="flex items-center justify-between pb-3">
                <span className="text-xs font-mono uppercase text-muted-foreground tracking-wider font-semibold">Control Center</span>
                <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-black text-white tracking-tight">Active Mesh</div>
              <p className="text-xs text-emerald-400 mt-1 font-mono">Full Admin Governance</p>
              <Button variant="link" className="p-0 h-auto mt-4 text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1">
                Admin Settings <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </ThreeDCard>
          </>
        ) : (
          <>
            {/* Employee Metric 1: Available PTO Balance */}
            <ThreeDCard glowColor="blue" intensity={15} onClick={() => router.push("/time-off")}>
              <div className="flex items-center justify-between pb-3">
                <span className="text-xs font-mono uppercase text-muted-foreground tracking-wider font-semibold">My PTO Balance</span>
                <div className="p-2.5 rounded-xl bg-blue-600/15 border border-blue-500/30 text-blue-400">
                  <CalendarDays className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-black text-white tracking-tight">{userPTOAvailable} Days</div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 mt-1 font-mono">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Available for request</span>
              </div>
              <Button variant="link" className="p-0 h-auto mt-4 text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1">
                Request Leave <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </ThreeDCard>

            {/* Employee Metric 2: Next Payday */}
            <ThreeDCard glowColor="cyan" intensity={15} onClick={() => router.push("/payroll")}>
              <div className="flex items-center justify-between pb-3">
                <span className="text-xs font-mono uppercase text-muted-foreground tracking-wider font-semibold">Next Payday</span>
                <div className="p-2.5 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-400">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-black text-white tracking-tight">{paydayFormatted}</div>
              <p className="text-xs text-sky-400 mt-1 font-mono">In {daysUntilPayday} days</p>
              <Button variant="link" className="p-0 h-auto mt-4 text-xs text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1">
                View Payslips <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </ThreeDCard>

            {/* Employee Metric 3: My Requests Status */}
            <ThreeDCard glowColor="white" intensity={15} onClick={() => router.push("/time-off")}>
              <div className="flex items-center justify-between pb-3">
                <span className="text-xs font-mono uppercase text-muted-foreground tracking-wider font-semibold">My Pending Requests</span>
                <div className="p-2.5 rounded-xl bg-white/10 border border-white/20 text-white">
                  <FileText className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-black text-white tracking-tight">{userPendingRequests} Pending</div>
              <p className="text-xs text-gray-400 mt-1 font-mono">Awaiting manager approval</p>
              <Button variant="link" className="p-0 h-auto mt-4 text-xs text-white hover:text-gray-300 font-semibold flex items-center gap-1">
                View Requests <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </ThreeDCard>

            {/* Employee Metric 4: Next Performance Review */}
            <ThreeDCard glowColor="emerald" intensity={15} onClick={() => router.push("/performance")}>
              <div className="flex items-center justify-between pb-3">
                <span className="text-xs font-mono uppercase text-muted-foreground tracking-wider font-semibold">Next Review Cycle</span>
                <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                  <Target className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-black text-white tracking-tight">Q4 Cycle</div>
              <p className="text-xs text-emerald-400 mt-1 font-mono">Scheduled Dec 15</p>
              <Button variant="link" className="p-0 h-auto mt-4 text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1">
                Review Goals <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </ThreeDCard>
          </>
        )}
      </motion.div>

      {/* 3D Telemetry Analytics Chart & AI Intelligence Grid */}
      <motion.div variants={itemVariants} className="grid lg:grid-cols-12 gap-6">
        {/* 3D Telemetry Chart Widget (7 cols) */}
        <div className="lg:col-span-7">
          <ThreeDBarChart />
        </div>

        {/* AI Workforce Insights Card (5 cols) */}
        <div className="lg:col-span-5 flex flex-col">
          <ThreeDCard glowColor="cyan" intensity={10} className="h-full flex flex-col justify-between p-6 bg-gradient-to-br from-[#0B0F19] to-[#0A1120]">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-sky-500/15 border border-sky-500/30 text-sky-400">
                    <Bot className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white uppercase">Neural HR Insights</h3>
                    <p className="text-xs text-sky-400 font-mono">Autonomous AI Telemetry</p>
                  </div>
                </div>
                <span className="px-2 py-1 rounded-lg bg-sky-500/20 text-sky-300 text-[10px] font-mono uppercase font-bold">
                  99.9% Active
                </span>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                Workforce satisfaction score is currently <strong className="text-emerald-400">96.8%</strong>. Automated analysis confirms optimal employee retention across both <strong className="text-blue-400">Technology</strong> and <strong className="text-sky-400">Research</strong> divisions.
              </p>
            </div>

            <div className="pt-6 border-t border-white/10 flex items-center justify-between">
              <Button 
                onClick={() => router.push(isAdmin ? "/admin" : "/performance")}
                className="w-full bg-white/5 hover:bg-white/10 border border-sky-500/30 text-sky-300 text-xs font-mono font-bold rounded-xl h-11"
              >
                Run System Audit
              </Button>
            </div>
          </ThreeDCard>
        </div>
      </motion.div>

      {/* Dual Corporate Division Showcase */}
      <motion.div variants={itemVariants} className="grid md:grid-cols-2 gap-6">
        <ThreeDCard glowColor="blue" intensity={8} className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-4">
              <div className="p-3.5 rounded-2xl bg-blue-600/15 border border-blue-500/30 text-blue-400 shrink-0">
                <Code className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black text-white uppercase">Three Dine Technology</h3>
                  <span className="px-2 py-0.5 rounded bg-blue-600/20 text-blue-300 text-[10px] font-mono uppercase font-bold">
                    Tech Active
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Building software architecture, custom web platforms, and digital AI products across the global enterprise.
                </p>
              </div>
            </div>
            <ThreeDInteractiveGlobe size={80} color="#2563eb" />
          </div>
        </ThreeDCard>

        <ThreeDCard glowColor="cyan" intensity={8} className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-4">
              <div className="p-3.5 rounded-2xl bg-sky-500/15 border border-sky-500/30 text-sky-400 shrink-0">
                <Microscope className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black text-white uppercase">Three Dine Research</h3>
                  <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 text-[10px] font-mono uppercase font-bold">
                    Research Active
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Delivering academic research, machine learning innovations, and scientific publications for scholars.
                </p>
              </div>
            </div>
            <ThreeDInteractiveGlobe size={80} color="#38bdf8" />
          </div>
        </ThreeDCard>
      </motion.div>

      {/* Main Grid: Announcements & Dynamic Absence Log */}
      <motion.div variants={itemVariants} className="grid gap-6 lg:grid-cols-7">
        {/* Company Announcements (4 cols) */}
        <div className="lg:col-span-4">
          <ThreeDCard glowColor="blue" intensity={10} className="h-full">
            <div className="flex items-center justify-between pb-6 border-b border-white/10">
              <div>
                <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-400" />
                  Corporate Broadcasts
                </h3>
                <p className="text-xs text-muted-foreground">Official Three Dine Corporation Updates</p>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-blue-600/15 text-blue-300 text-[10px] font-mono border border-blue-500/30 font-bold">
                Live Feed
              </span>
            </div>

            <div className="space-y-5 pt-6">
              {[
                {
                  title: "Annual Three Dine Innovation Summit 2026",
                  desc: "Three Dine Corporation is hosting the futuristic Technology & Research leadership summit.",
                  time: "1 hour ago",
                },
                {
                  title: "New Employee Recognition Program",
                  desc: "We are excited to launch our new peer appreciation program starting next month.",
                  time: "4 hours ago",
                }
              ].map((item, i) => (
                <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-blue-500/40 transition-all duration-300 flex items-start gap-4 group">
                  <div className="w-10 h-10 rounded-xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0 group-hover:scale-110 transition-transform">
                    <Award className="w-5 h-5" />
                  </div>
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">
                        {item.title}
                      </h4>
                      <span className="text-[10px] font-mono text-muted-foreground">{item.time}</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ThreeDCard>
        </div>

        {/* Dynamic Who is out today (3 cols) */}
        <div className="lg:col-span-3">
          <ThreeDCard glowColor="white" intensity={10} className="h-full">
            <div className="flex items-center justify-between pb-6 border-b border-white/10">
              <div>
                <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-sky-400" />
                  Team Absence Log
                </h3>
                <p className="text-xs text-muted-foreground">Members on approved leave today</p>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-white/10 text-white text-[10px] font-mono border border-white/20 font-bold">
                {outToday.length} Out
              </span>
            </div>

            <div className="space-y-4 pt-6">
              {outToday.map((person, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between hover:border-blue-500/40 transition-all">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border border-blue-500/40 shadow-sm">
                      <AvatarFallback className="bg-blue-600 text-white font-bold text-xs">
                        {person.name.split(' ').map((n: string) => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="text-sm font-bold text-white">{person.name}</h4>
                      <p className="text-xs text-muted-foreground">{person.role}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded bg-blue-600/20 text-blue-300 text-[10px] font-mono block">
                      {person.status}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-mono mt-0.5 block">
                      Back {person.return}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </ThreeDCard>
        </div>
      </motion.div>

      {/* Interactive Quick Actions Modal */}
      <Dialog open={showActionModal} onOpenChange={setShowActionModal}>
        <DialogContent className="sm:max-w-[480px] bg-[#0F1322] border border-blue-500/30 text-white backdrop-blur-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-white uppercase flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-400" />
              Quick Action Hub
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Select an action based on your {role.replace('_', ' ')} permission level.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 py-4">
            {isAdmin ? (
              <>
                <Button 
                  onClick={() => { setShowActionModal(false); router.push("/directory"); }}
                  className="w-full justify-start h-12 bg-white/5 border border-white/10 hover:border-blue-400 hover:bg-blue-600/20 text-white text-xs font-mono font-bold rounded-xl"
                >
                  <Plus className="w-4 h-4 mr-3 text-blue-400" /> Add New Employee Profile
                </Button>
                <Button 
                  onClick={() => { setShowActionModal(false); router.push("/time-off"); }}
                  className="w-full justify-start h-12 bg-white/5 border border-white/10 hover:border-sky-400 hover:bg-sky-600/20 text-white text-xs font-mono font-bold rounded-xl"
                >
                  <CheckCircle2 className="w-4 h-4 mr-3 text-sky-400" /> Review & Approve Leave Requests
                </Button>
                <Button 
                  onClick={() => { setShowActionModal(false); router.push("/payroll"); }}
                  className="w-full justify-start h-12 bg-white/5 border border-white/10 hover:border-emerald-400 hover:bg-emerald-600/20 text-white text-xs font-mono font-bold rounded-xl"
                >
                  <TrendingUp className="w-4 h-4 mr-3 text-emerald-400" /> Run Direct Deposit Payroll
                </Button>
                <Button 
                  onClick={() => { setShowActionModal(false); router.push("/admin"); }}
                  className="w-full justify-start h-12 bg-white/5 border border-white/10 hover:border-purple-400 hover:bg-purple-600/20 text-white text-xs font-mono font-bold rounded-xl"
                >
                  <ShieldCheck className="w-4 h-4 mr-3 text-purple-400" /> Enterprise Admin Control Mesh
                </Button>
              </>
            ) : (
              <>
                <Button 
                  onClick={() => { setShowActionModal(false); router.push("/time-off"); }}
                  className="w-full justify-start h-12 bg-white/5 border border-white/10 hover:border-blue-400 hover:bg-blue-600/20 text-white text-xs font-mono font-bold rounded-xl"
                >
                  <CalendarDays className="w-4 h-4 mr-3 text-blue-400" /> Submit Time Off Request
                </Button>
                <Button 
                  onClick={() => { setShowActionModal(false); router.push("/payroll"); }}
                  className="w-full justify-start h-12 bg-white/5 border border-white/10 hover:border-sky-400 hover:bg-sky-600/20 text-white text-xs font-mono font-bold rounded-xl"
                >
                  <Clock className="w-4 h-4 mr-3 text-sky-400" /> View Salary & Paystubs
                </Button>
                <Button 
                  onClick={() => { setShowActionModal(false); router.push("/performance"); }}
                  className="w-full justify-start h-12 bg-white/5 border border-white/10 hover:border-emerald-400 hover:bg-emerald-600/20 text-white text-xs font-mono font-bold rounded-xl"
                >
                  <Target className="w-4 h-4 mr-3 text-emerald-400" /> Update Performance Goals
                </Button>
                <Button 
                  onClick={() => { setShowActionModal(false); router.push("/org-chart"); }}
                  className="w-full justify-start h-12 bg-white/5 border border-white/10 hover:border-purple-400 hover:bg-purple-600/20 text-white text-xs font-mono font-bold rounded-xl"
                >
                  <Building className="w-4 h-4 mr-3 text-purple-400" /> View Company Hierarchy Tree
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
