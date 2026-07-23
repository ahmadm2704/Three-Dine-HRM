"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThreeDBackground } from "@/components/ui/ThreeDBackground";
import { ThreeDCard } from "@/components/ui/ThreeDCard";
import { ThreeDInteractiveGlobe } from "@/components/ui/ThreeDInteractiveGlobe";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  ArrowRight, 
  Lock, 
  Mail, 
  Loader2, 
  Building2, 
  Code, 
  ShieldCheck, 
  Sparkles,
  Microscope,
  Activity,
  Cpu
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState("");
  const [resetError, setResetError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok && data.employee) {
        localStorage.setItem("threedine_user", JSON.stringify({
          id: data.employee.id,
          firstName: data.employee.first_name,
          lastName: data.employee.last_name,
          email: data.employee.email,
          role: data.employee.role || "employee"
        }));
        router.push("/dashboard");
      } else {
        setLoading(false);
        setErrorMsg(data.error || "Invalid credentials provided.");
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
      setErrorMsg("An unexpected connection error occurred.");
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    setResetError("");
    setResetSuccess("");

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail })
      });

      const data = await response.json();

      if (response.ok) {
        setResetSuccess(data.message);
        setResetEmail("");
      } else {
        setResetError(data.error || "An error occurred during password reset.");
      }
    } catch (err) {
      console.error(err);
      setResetError("An unexpected connection error occurred.");
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05070D] text-foreground flex flex-col relative overflow-hidden bg-grid-cyber selection:bg-blue-600/30">
      {/* 3D WebGL Canvas Background */}
      <ThreeDBackground />

      {/* Top Ambient Glow Blurs */}
      <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] rounded-full bg-blue-600/15 blur-[160px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[20%] w-[500px] h-[500px] rounded-full bg-sky-500/15 blur-[160px] pointer-events-none" />

      {/* Corporate Header with Seamless Transparent Logo */}
      <header className="p-6 sm:p-8 relative z-20 flex justify-between items-center max-w-7xl mx-auto w-full">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-4"
        >
          {/* Seamless Transparent Logo */}
          <div className="flex items-center gap-3">
            <img 
              src="/logo-transparent.png" 
              alt="Three Dine Corporation Logo" 
              className="h-10 sm:h-12 w-auto object-contain drop-shadow-[0_0_15px_rgba(37,99,235,0.5)]"
            />
          </div>
        </motion.div>

        <motion.a 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          href="https://threedinecorporation.com/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="px-4 py-2.5 rounded-xl bg-white/5 border border-blue-500/30 hover:border-blue-400 text-xs uppercase font-mono tracking-wider text-white font-bold transition-all duration-300 flex items-center gap-2 backdrop-blur-md shadow-lg hover:shadow-blue-500/20 group"
        >
          <Building2 className="w-4 h-4 text-blue-400" />
          <span>Get In Touch</span>
          <ArrowRight className="w-3.5 h-3.5 text-blue-400 group-hover:translate-x-1 transition-transform" />
        </motion.a>
      </header>

      {/* Main Split Theme Content */}
      <main className="flex-1 flex flex-col justify-center items-center p-6 relative z-20 max-w-6xl mx-auto w-full my-auto">
        {/* Banner Tagline */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-center mb-10 space-y-3"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-600/10 border border-blue-500/30 text-blue-400 text-xs font-mono backdrop-blur-md shadow-inner">
            <Activity className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
            <span>THREE DINE HR INTELLIGENCE PLATFORM</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white uppercase">
            Where Research Meets <span className="text-gradient-blue">Technology</span>
          </h1>

          <p className="text-muted-foreground text-sm font-medium max-w-xl mx-auto">
            Sign in to access Three Dine Corporation's unified employee management portal, payroll mesh, and workforce analytics.
          </p>
        </motion.div>

        {/* Dual Split Cards: Tech & Research Showcase + Login Form */}
        <div className="grid lg:grid-cols-12 gap-8 w-full items-stretch">
          {/* Left Column: Corporate Divisions */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-6 grid grid-cols-1 gap-4"
          >
            {/* Tech Card */}
            <a href="https://threedinecorporation.com/technology" target="_blank" rel="noopener noreferrer" className="block outline-none group focus:ring-2 focus:ring-blue-500 rounded-xl">
              <ThreeDCard glowColor="blue" intensity={12} className="p-6 bg-gradient-to-br from-[#0B0F19] to-[#0F172A] border-blue-500/40 cursor-pointer h-full transition-colors hover:border-blue-400">
                <div className="flex items-center justify-between">
                  <div className="space-y-2 max-w-xs">
                    <span className="text-[10px] font-mono tracking-widest text-blue-400 uppercase font-bold">Division 01</span>
                    <h3 className="text-2xl font-black tracking-tight text-white uppercase group-hover:text-blue-400 transition-colors">Three Dine Technology</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Building the digital future with cutting-edge web development, autonomous software, and enterprise solutions.
                    </p>
                  </div>
                  {/* 3D WebGL Torus Mesh */}
                  <ThreeDInteractiveGlobe size={100} color="#2563eb" />
                </div>
                <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono font-bold text-blue-400">
                  <span>ENTER TECHNOLOGY</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </ThreeDCard>
            </a>

            {/* Research Card */}
            <a href="https://threedinecorporation.com/research" target="_blank" rel="noopener noreferrer" className="block outline-none group focus:ring-2 focus:ring-sky-500 rounded-xl">
              <ThreeDCard glowColor="cyan" intensity={12} className="p-6 bg-gradient-to-br from-[#0B0F19] to-[#0A1120] border-sky-500/40 cursor-pointer h-full transition-colors hover:border-sky-400">
                <div className="flex items-center justify-between">
                  <div className="space-y-2 max-w-xs">
                    <span className="text-[10px] font-mono tracking-widest text-sky-400 uppercase font-bold">Division 02</span>
                    <h3 className="text-2xl font-black tracking-tight text-white uppercase group-hover:text-sky-400 transition-colors">Three Dine Research</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Delivering and shaping the epitome of academia for scholars, AI researchers, and digital innovators.
                    </p>
                  </div>
                  {/* 3D WebGL Torus Mesh Cyan */}
                  <ThreeDInteractiveGlobe size={100} color="#38bdf8" />
                </div>
                <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono font-bold text-sky-400">
                  <span>ENTER RESEARCH</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </ThreeDCard>
            </a>
          </motion.div>

          {/* Right Column: 3D Login Card */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="lg:col-span-6 flex flex-col justify-center"
          >
            <ThreeDCard glowColor="blue" intensity={12} className="glass-card">
              <CardContent className="p-6">
                <div className="mb-6 border-b border-white/10 pb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-extrabold text-white tracking-tight uppercase">Portal Sign In</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">Authenticate credentials to open HR portal</p>
                  </div>
                  <div className="p-2 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-400">
                    <Cpu className="w-5 h-5 animate-pulse" />
                  </div>
                </div>

                {errorMsg && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 text-center font-mono flex items-center justify-center gap-2"
                  >
                    <ShieldCheck className="w-4 h-4 text-rose-400" />
                    {errorMsg}
                  </motion.div>
                )}

                <form onSubmit={handleLogin} className="space-y-5" suppressHydrationWarning>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-xs uppercase tracking-wider font-mono text-blue-300 flex items-center justify-between font-bold">
                      <span>Work Email</span>
                      <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                    </Label>
                    <div className="relative group">
                      <Mail className="absolute left-3.5 top-3 h-5 w-5 text-blue-400/70 group-focus-within:text-blue-400 transition-colors" />
                      <Input 
                        id="email" 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@threedine.com" 
                        className="pl-11 h-12 bg-black/50 border-blue-500/30 focus:border-blue-400 focus:ring-1 focus:ring-blue-400/50 rounded-xl text-white text-sm font-medium transition-all placeholder:text-muted-foreground/50"
                        required 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-xs uppercase tracking-wider font-mono text-blue-300 font-bold">
                        Password
                      </Label>
                      <Dialog>
                        <DialogTrigger asChild>
                          <button type="button" suppressHydrationWarning className="text-xs font-mono text-sky-400 hover:text-sky-300 hover:underline transition-colors focus:outline-none">
                            Forgot Key?
                          </button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md bg-[#0B0F19] border-blue-500/30 text-white">
                          <DialogHeader>
                            <DialogTitle className="text-white text-xl font-bold uppercase tracking-tight">System Access Recovery</DialogTitle>
                            <DialogDescription className="text-muted-foreground text-xs mt-1">
                              Enter your work email. A new secure credential key will be transmitted to your registered personal email address.
                            </DialogDescription>
                          </DialogHeader>
                          
                          <form onSubmit={handleForgotPassword} className="space-y-4 mt-4">
                            <div className="space-y-2">
                              <Label htmlFor="reset-email" className="text-xs uppercase font-mono text-blue-300 font-bold">Work Email</Label>
                              <Input
                                id="reset-email"
                                type="email"
                                value={resetEmail}
                                onChange={(e) => setResetEmail(e.target.value)}
                                placeholder="you@threedine.com"
                                className="bg-black/50 border-blue-500/30 focus:border-blue-400 focus:ring-1 focus:ring-blue-400/50 text-white text-sm"
                                required
                              />
                            </div>
                            
                            {resetError && <div className="text-xs text-rose-400 p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-xl font-mono flex items-center gap-2"><ShieldCheck className="w-3.5 h-3.5"/>{resetError}</div>}
                            {resetSuccess && <div className="text-xs text-emerald-400 p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl font-mono flex items-center gap-2"><ShieldCheck className="w-3.5 h-3.5"/>{resetSuccess}</div>}
                            
                            <Button type="submit" disabled={resetLoading} className="w-full bg-blue-600 hover:bg-blue-500 text-white uppercase text-xs font-bold tracking-wider h-11 rounded-xl transition-all">
                              {resetLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                              Transmit Credentials
                            </Button>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </div>
                    <div className="relative group">
                      <Lock className="absolute left-3.5 top-3 h-5 w-5 text-blue-400/70 group-focus-within:text-blue-400 transition-colors" />
                      <Input 
                        id="password" 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••" 
                        className="pl-11 h-12 bg-black/50 border-blue-500/30 focus:border-blue-400 focus:ring-1 focus:ring-blue-400/50 rounded-xl text-white text-sm font-medium transition-all placeholder:text-muted-foreground/50"
                        required 
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    suppressHydrationWarning
                    className="w-full h-12 text-sm font-extrabold tracking-wider uppercase bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_25px_rgba(37,99,235,0.5)] transition-all duration-300 rounded-xl relative overflow-hidden group border border-blue-400/40" 
                    disabled={loading}
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin text-white" />
                          <span>Authenticating Mesh...</span>
                        </>
                      ) : (
                        <>
                          <span>Sign In To HRIS</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                        </>
                      )}
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  </Button>
                </form>

                <div className="mt-6 pt-5 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <ShieldCheck className="w-3.5 h-3.5" /> 256-Bit Encrypted
                  </span>
                  <span className="text-blue-400">Three Dine IT Core</span>
                </div>
              </CardContent>
            </ThreeDCard>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 relative z-20 text-center text-xs text-muted-foreground/60 font-mono border-t border-white/5 bg-black/40">
        © {new Date().getFullYear()} Three Dine Corporation • Where Research Meets Technology
      </footer>
    </div>
  );
}
