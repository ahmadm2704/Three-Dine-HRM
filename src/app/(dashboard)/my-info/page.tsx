"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, 
  Briefcase, 
  Calendar, 
  FileText, 
  Target, 
  PhoneCall, 
  MapPin, 
  Mail, 
  Camera, 
  Edit3, 
  Building, 
  Users, 
  CheckCircle2, 
  Clock, 
  Upload, 
  ShieldCheck,
  Sparkles,
  Save,
  Globe,
  Heart,
  HelpCircle,
  Phone,
  Lock,
  Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThreeDPageHeader } from "@/components/ui/ThreeDPageHeader";
import { ThreeDCard } from "@/components/ui/ThreeDCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { supabase } from "@/lib/supabase";

export default function MyInfoPage() {
  const [activeTab, setActiveTab] = useState<"personal" | "job" | "time_off" | "documents" | "performance" | "emergency">("personal");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loadingDb, setLoadingDb] = useState(true);
  
  // Dynamic Sub-Tab States
  const [timeOffRequests, setTimeOffRequests] = useState<any[]>([]);
  const [employeeDocs, setEmployeeDocs] = useState<any[]>([]);
  const [performance, setPerformance] = useState<any>(null);

  // Dynamic Employee Profile State (Fetched 100% from database)
  const [profile, setProfile] = useState<any>({
    id: "",
    employeeNumber: "",
    firstName: "",
    middleName: "",
    lastName: "",
    jobTitle: "",
    department: "",
    managerId: "",
    managerName: "None (Unassigned)",
    managerTitle: "",
    managerPhotoUrl: "",
    hireDate: "",
    workEmail: "",
    personalEmail: "",
    photoUrl: "",
    // Basic Info Fields
    birthDate: "",
    ssn: "",
    gender: "",
    maritalStatus: "",
    nationalId: "",
    placeOfBirth: "",
    nationality: "",
    // Address Fields
    street1: "",
    street2: "",
    city: "",
    province: "",
    postalCode: "",
    country: "",
    // Contact Phones
    workPhone: "",
    workPhoneExt: "",
    mobilePhone: "",
    homePhone: "",
    // Emergency Contact
    emergencyName: "",
    emergencyRelationship: "",
    emergencyPhone: "",
    emergencyEmail: "",
    // Employment Info
    employmentType: "",
    employmentStatus: "",
  });

  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState<any>({ ...profile });
  const [saving, setSaving] = useState(false);

  // Fetch logged in user and lookup manager directly from Database
  useEffect(() => {
    async function loadDatabaseProfile() {
      setLoadingDb(true);
      let localUser: any = null;
      let userEmail = "";

      const saved = localStorage.getItem("threedine_user");
      if (saved) {
        try {
          localUser = JSON.parse(saved);
          if (localUser.email) userEmail = localUser.email;
        } catch (e) {}
      }

      try {
        const response = await fetch('/api/employees');
        if (response.ok) {
          const { employees } = await response.json();
          if (Array.isArray(employees) && employees.length > 0) {
            // Find current employee in database by email or ID
            const currentEmp = employees.find((e: any) => 
              (localUser?.id && String(e.id) === String(localUser.id)) || 
              e.email?.toLowerCase().trim() === userEmail.toLowerCase().trim()
            );

            if (currentEmp) {
              // Lookup Manager directly from manager_id in database
              let mgrName = "None (Unassigned)";
              let mgrTitle = "Unassigned Manager";
              let mgrPhoto = "";

              if (currentEmp.manager_id) {
                const managerObj = employees.find((m: any) => String(m.id) === String(currentEmp.manager_id));
                if (managerObj) {
                  mgrName = `${managerObj.first_name} ${managerObj.last_name}`;
                  mgrTitle = managerObj.job_title || "Manager";
                  mgrPhoto = managerObj.photo_url || "";
                }
              } else if (currentEmp.accessLevel === 'super_admin' || currentEmp.job_title?.toLowerCase().includes('ceo')) {
                mgrName = "Executive Leadership (Board)";
                mgrTitle = "Board of Directors";
              }

              // Extract custom_fields, address, emergency_contact
              const cf = currentEmp.custom_fields || {};
              const addr = currentEmp.address || {};
              const emg = currentEmp.emergency_contact || {};

              // Format hire date
              let formattedHireDate = "";
              if (currentEmp.start_date) {
                try {
                  const d = new Date(currentEmp.start_date);
                  formattedHireDate = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
                } catch (e) {}
              }

              setProfile((prev: any) => ({
                ...prev,
                id: currentEmp.id || prev.id,
                employeeNumber: cf.employee_number || cf.employeeNumber || prev.employeeNumber,
                firstName: currentEmp.first_name || localUser?.firstName || prev.firstName,
                lastName: currentEmp.last_name || localUser?.lastName || prev.lastName,
                middleName: cf.middle_name || prev.middleName,
                workEmail: currentEmp.email || userEmail,
                personalEmail: cf.personal_email || prev.personalEmail,
                jobTitle: currentEmp.job_title || (currentEmp.accessLevel === 'super_admin' ? 'Chief Executive Officer' : prev.jobTitle),
                department: currentEmp.departments?.name || currentEmp.department_name || prev.department,
                managerId: currentEmp.manager_id || "",
                managerName: mgrName,
                managerTitle: mgrTitle,
                managerPhotoUrl: mgrPhoto,
                hireDate: formattedHireDate,
                photoUrl: currentEmp.photo_url || currentEmp.avatar_url || localUser?.photoUrl || prev.photoUrl,
                employmentStatus: currentEmp.employment_status ? (currentEmp.employment_status.charAt(0).toUpperCase() + currentEmp.employment_status.slice(1)) : prev.employmentStatus,
                employmentType: currentEmp.employment_type ? (currentEmp.employment_type.charAt(0).toUpperCase() + currentEmp.employment_type.slice(1)) : prev.employmentType,
                // Personal Details
                birthDate: cf.birth_date || prev.birthDate,
                ssn: cf.ssn || prev.ssn,
                gender: cf.gender || prev.gender,
                maritalStatus: cf.marital_status || prev.maritalStatus,
                nationalId: cf.national_id || prev.nationalId,
                placeOfBirth: cf.place_of_birth || prev.placeOfBirth,
                nationality: cf.nationality || prev.nationality,
                // Address
                street1: addr.street1 || prev.street1,
                street2: addr.street2 || prev.street2,
                city: addr.city || prev.city,
                province: addr.province || prev.province,
                postalCode: addr.postal_code || prev.postalCode,
                country: addr.country || prev.country,
                // Contact
                workPhone: currentEmp.phone || prev.workPhone,
                workPhoneExt: cf.work_phone_ext || prev.workPhoneExt,
                mobilePhone: cf.mobile_phone || prev.mobilePhone,
                homePhone: cf.home_phone || prev.homePhone,
                // Emergency
                emergencyName: emg.name || prev.emergencyName,
                emergencyRelationship: emg.relationship || prev.emergencyRelationship,
                emergencyPhone: emg.phone || prev.emergencyPhone,
                emergencyEmail: emg.email || prev.emergencyEmail,
              }));

              // --- Fetch Dynamic Sub-Tab Data from Database ---
              // 1. Time Off
              const { data: timeOffData } = await supabase
                .from('time_off_requests')
                .select('*')
                .eq('employee_id', currentEmp.id);
              if (timeOffData) setTimeOffRequests(timeOffData);

              // 2. Documents
              const { data: docsData } = await supabase
                .from('documents')
                .select('*')
                .eq('employee_id', currentEmp.id);
              if (docsData) setEmployeeDocs(docsData);

              // 3. Performance
              const { data: perfData } = await supabase
                .from('performance_reviews')
                .select('*')
                .eq('employee_id', currentEmp.id)
                .order('created_at', { ascending: false })
                .limit(1);
              if (perfData && perfData.length > 0) setPerformance(perfData[0]);
            }
          }
        }
      } catch (err) {
        console.error("Error loading profile from DB:", err);
      } finally {
        setLoadingDb(false);
      }
    }

    loadDatabaseProfile();
  }, []);

  // Calculate age from birthDate
  const calculateAge = (birthDateStr: string) => {
    if (!birthDateStr) return null;
    const birthDate = new Date(birthDateStr);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age > 0 ? age : null;
  };

  // Handle Photo Upload (Save to DB & Sync globally)
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Photo = reader.result as string;
        const updated = { ...profile, photoUrl: base64Photo };
        setProfile(updated);
        
        // 1. Sync to localStorage
        const saved = localStorage.getItem("threedine_user");
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            parsed.photoUrl = base64Photo;
            localStorage.setItem("threedine_user", JSON.stringify(parsed));
          } catch (err) {}
        }

        // 2. Save directly to database API so it reflects on Org Chart
        if (profile.id && profile.id.length > 5) {
          try {
            await fetch(`/api/employees/${profile.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ photo_url: base64Photo })
            });
          } catch (err) {
            console.error("Failed to save photo to DB:", err);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Save Edit Profile Modal to Supabase DB
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setProfile(formData);

    // 1. Sync to localStorage
    const saved = localStorage.getItem("threedine_user");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        parsed.firstName = formData.firstName;
        parsed.lastName = formData.lastName;
        parsed.email = formData.workEmail;
        localStorage.setItem("threedine_user", JSON.stringify(parsed));
      } catch (err) {}
    }

    // 2. Sync to DB if valid UUID
    if (profile.id && profile.id.length > 5) {
      try {
        await fetch(`/api/employees/${profile.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            first_name: formData.firstName,
            last_name: formData.lastName,
            email: formData.workEmail,
            phone: formData.workPhone,
            custom_fields: {
              employee_number: profile.employeeNumber,
              middle_name: formData.middleName,
              birth_date: formData.birthDate,
              ssn: formData.ssn,
              gender: formData.gender,
              marital_status: formData.maritalStatus,
              national_id: formData.nationalId,
              place_of_birth: formData.placeOfBirth,
              nationality: formData.nationality,
              personal_email: formData.personalEmail,
              mobile_phone: formData.mobilePhone,
              home_phone: formData.homePhone,
              work_phone_ext: formData.workPhoneExt,
            },
            address: {
              street1: formData.street1,
              street2: formData.street2,
              city: formData.city,
              province: formData.province,
              postal_code: formData.postalCode,
              country: formData.country,
            },
            emergency_contact: {
              name: formData.emergencyName,
              relationship: formData.emergencyRelationship,
              phone: formData.emergencyPhone,
              email: formData.emergencyEmail,
            }
          })
        });
      } catch (err) {
        console.error("Failed to save profile to DB:", err);
      }
    }

    setSaving(false);
    setShowEditModal(false);
  };

  const fullName = `${profile.firstName} ${profile.middleName ? profile.middleName + ' ' : ''}${profile.lastName}`;
  const initials = `${profile.firstName[0] || ''}${profile.lastName[0] || ''}`.toUpperCase();
  const age = calculateAge(profile.birthDate);

  const tabs = [
    { id: "personal", label: "Personal", icon: User },
    { id: "job", label: "Job", icon: Briefcase },
    { id: "time_off", label: "Time Off", icon: Calendar },
    { id: "documents", label: "Documents", icon: FileText },
    { id: "performance", label: "Performance", icon: Target },
    { id: "emergency", label: "Emergency", icon: Heart },
  ];

  return (
    <div className="space-y-6 pb-12">
      <ThreeDPageHeader
        title="My Personnel Profile"
        subtitle="View and manage your dynamic employee information, job details, time off, and emergency contact."
        badge="Personnel Registry"
      >
        <Button 
          onClick={() => { setFormData({ ...profile }); setShowEditModal(true); }}
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-[0_0_20px_rgba(37,99,235,0.4)] rounded-2xl text-xs uppercase tracking-wider border border-blue-400/40 h-11 px-5"
        >
          <Edit3 className="mr-2 h-4 w-4" /> Edit Profile
        </Button>
      </ThreeDPageHeader>

      {/* BambooHR Profile Banner Card */}
      <ThreeDCard glowColor="blue" intensity={10} className="p-6 md:p-8 bg-gradient-to-r from-blue-950/90 via-[#0C101D] to-sky-950/70 border border-blue-500/35 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          
          {/* Avatar Container with Upload Overlay */}
          <div className="flex items-center gap-6">
            <div className="relative group shrink-0">
              <Avatar className="h-24 w-24 md:h-28 md:w-28 border-2 border-blue-400/60 shadow-[0_0_25px_rgba(37,99,235,0.5)]">
                {profile.photoUrl ? (
                  <AvatarImage src={profile.photoUrl} alt={fullName} className="object-cover" />
                ) : (
                  <AvatarFallback className="bg-gradient-to-br from-blue-600 to-sky-500 text-white text-2xl font-black">
                    {initials}
                  </AvatarFallback>
                )}
              </Avatar>

              {/* Photo Upload Trigger Button */}
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-xs font-mono font-bold backdrop-blur-xs cursor-pointer"
                title="Click to Upload Profile Photo"
              >
                <Camera className="w-5 h-5 mb-1 text-blue-400" />
                <span>Upload Photo</span>
              </button>

              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handlePhotoUpload} 
                accept="image/*" 
                className="hidden" 
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-0.5 rounded-full bg-blue-600/20 text-blue-300 border border-blue-500/40 text-[10px] font-mono font-bold uppercase tracking-wider">
                  Employee #{profile.employeeNumber}
                </span>
                <span className="px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" /> {profile.employmentStatus}
                </span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight">
                {fullName}
              </h2>

              <p className="text-sm font-semibold text-sky-400 flex items-center gap-2">
                <Briefcase className="w-4 h-4" /> {profile.jobTitle}
              </p>
            </div>
          </div>

          {/* Quick Info Badges */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0 border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6 text-xs font-mono">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Building className="w-4 h-4 text-blue-400" />
              <span>Dept: <strong className="text-white">{profile.department}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="w-4 h-4 text-sky-400" />
              <span>Email: <strong className="text-white">{profile.workEmail}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span>Hired: <strong className="text-white">{profile.hireDate}</strong></span>
            </div>
          </div>
        </div>

        {/* BambooHR Navigation Sub-tabs Bar */}
        <div className="mt-8 pt-4 border-t border-white/10 flex items-center gap-2 overflow-x-auto scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all duration-300 shrink-0 ${
                  isActive 
                    ? "bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.5)] border border-blue-400/50" 
                    : "text-muted-foreground hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-blue-400"}`} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </ThreeDCard>

      {/* Main Tab Content Layout Grid */}
      <div className="grid lg:grid-cols-12 gap-6">

        {/* Left Sidebar Column (BambooHR Employee Overview & Manager Card) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Contact Overview Card */}
          <ThreeDCard glowColor="cyan" intensity={8} className="p-6">
            <h3 className="text-sm font-black text-white uppercase tracking-wider mb-4 pb-3 border-b border-white/10 flex items-center justify-between">
              <span>Contact Overview</span>
              <PhoneCall className="w-4 h-4 text-sky-400" />
            </h3>

            <div className="space-y-4 text-xs font-mono">
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase">Work Phone</span>
                <span className="text-white font-bold">{profile.workPhone}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase">Mobile Phone</span>
                <span className="text-white font-bold">{profile.mobilePhone}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase">Work Email</span>
                <span className="text-sky-400 font-bold underline truncate block">{profile.workEmail}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase">Personal Email</span>
                <span className="text-white font-bold truncate block">{profile.personalEmail}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase">Primary Address</span>
                <span className="text-white font-bold block">{profile.street1}, {profile.city}, {profile.province}</span>
              </div>
            </div>
          </ThreeDCard>

          {/* Organization Structure Card with Assigned Manager Picture & Details */}
          <ThreeDCard glowColor="white" intensity={8} className="p-6">
            <h3 className="text-sm font-black text-white uppercase tracking-wider mb-4 pb-3 border-b border-white/10 flex items-center justify-between">
              <span>Organization Structure</span>
              <Users className="w-4 h-4 text-white" />
            </h3>

            <div className="space-y-5 text-xs font-mono">
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase mb-1">Department</span>
                <span className="text-blue-400 font-extrabold text-sm">{profile.department}</span>
              </div>

              {/* Direct Manager Card with Manager Picture */}
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-2">
                <span className="text-muted-foreground block text-[10px] uppercase font-bold text-sky-400">Direct Manager</span>
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border border-blue-500/50 shadow-md">
                    {profile.managerPhotoUrl ? (
                      <AvatarImage src={profile.managerPhotoUrl} alt={profile.managerName} className="object-cover" />
                    ) : (
                      <AvatarFallback className="bg-blue-600 text-white font-bold text-xs">
                        {profile.managerName.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div>
                    <h4 className="font-bold text-white text-sm">{profile.managerName}</h4>
                    <p className="text-[10px] text-muted-foreground">{profile.managerTitle}</p>
                  </div>
                </div>
              </div>

              <div>
                <span className="text-muted-foreground block text-[10px] uppercase mb-1">Employment Type</span>
                <span className="text-emerald-400 font-bold">{profile.employmentType}</span>
              </div>
            </div>
          </ThreeDCard>
        </div>

        {/* Right Tab Dynamic Details Column */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">

            {/* TAB 1: PERSONAL (Exact BambooHR Fields) */}
            {activeTab === "personal" && (
              <motion.div
                key="tab-personal"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {/* Basic Information Block */}
                <ThreeDCard glowColor="blue" intensity={8} className="p-6">
                  <h3 className="text-base font-black text-white uppercase tracking-wider mb-6 pb-3 border-b border-white/10 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <User className="w-5 h-5 text-blue-400" />
                      Basic Information
                    </span>
                    <span className="text-xs font-mono text-sky-400 font-bold">Employee #{profile.employeeNumber}</span>
                  </h3>

                  <div className="space-y-6 text-xs font-mono">
                    {/* Row 0: Employee # (Read-Only) */}
                    <div className="w-full max-w-[200px]">
                      <span className="text-muted-foreground block text-[10px] uppercase mb-1 flex items-center gap-1">
                        Employee # <Lock className="w-3 h-3 text-muted-foreground/60" />
                      </span>
                      <span className="text-white font-bold text-sm bg-white/5 p-2.5 rounded-xl border border-white/10 block">{profile.employeeNumber}</span>
                    </div>

                    {/* Row 1: Name Breakdown */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <span className="text-muted-foreground block text-[10px] uppercase mb-1">First Name*</span>
                        <span className="text-white font-bold text-sm bg-white/5 p-2.5 rounded-xl border border-white/10 block">{profile.firstName}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[10px] uppercase mb-1">Middle Name</span>
                        <span className="text-white font-bold text-sm bg-white/5 p-2.5 rounded-xl border border-white/10 block">{profile.middleName || "—"}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[10px] uppercase mb-1">Last Name*</span>
                        <span className="text-white font-bold text-sm bg-white/5 p-2.5 rounded-xl border border-white/10 block">{profile.lastName}</span>
                      </div>
                    </div>

                    {/* Row 2: Birth Date + Age */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <span className="text-muted-foreground block text-[10px] uppercase mb-1">Birth Date</span>
                        <div className="flex items-center gap-3">
                          <span className="text-white font-bold text-sm bg-white/5 p-2.5 rounded-xl border border-white/10 flex-1 block">{profile.birthDate}</span>
                          {age && (
                            <span className="text-xs font-mono text-sky-400 font-bold bg-sky-500/10 border border-sky-500/30 px-3 py-2.5 rounded-xl">
                              Age: {age}
                            </span>
                          )}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[10px] uppercase mb-1">SSN</span>
                        <span className="text-white font-bold text-sm bg-white/5 p-2.5 rounded-xl border border-white/10 block">{profile.ssn || "—"}</span>
                      </div>
                    </div>

                    {/* Row 3: Gender, Marital Status */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <span className="text-muted-foreground block text-[10px] uppercase mb-1">Gender</span>
                        <span className="text-white font-bold text-sm bg-white/5 p-2.5 rounded-xl border border-white/10 block">{profile.gender}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[10px] uppercase mb-1">Marital Status</span>
                        <span className="text-white font-bold text-sm bg-white/5 p-2.5 rounded-xl border border-white/10 block">{profile.maritalStatus}</span>
                      </div>
                    </div>

                    {/* Row 4: National ID, Place of Birth, Nationality */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <span className="text-muted-foreground block text-[10px] uppercase mb-1">National ID</span>
                        <span className="text-white font-bold text-sm bg-white/5 p-2.5 rounded-xl border border-white/10 block">{profile.nationalId}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[10px] uppercase mb-1">Place of Birth</span>
                        <span className="text-white font-bold text-sm bg-white/5 p-2.5 rounded-xl border border-white/10 block">{profile.placeOfBirth}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[10px] uppercase mb-1">Nationality</span>
                        <span className="text-white font-bold text-sm bg-white/5 p-2.5 rounded-xl border border-white/10 block">{profile.nationality}</span>
                      </div>
                    </div>
                  </div>
                </ThreeDCard>

                {/* Address Block */}
                <ThreeDCard glowColor="cyan" intensity={8} className="p-6">
                  <h3 className="text-base font-black text-white uppercase tracking-wider mb-6 pb-3 border-b border-white/10 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-sky-400" />
                    Address
                  </h3>

                  <div className="space-y-4 text-xs font-mono">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <span className="text-muted-foreground block text-[10px] uppercase mb-1">Street 1</span>
                        <span className="text-white font-bold text-sm bg-white/5 p-2.5 rounded-xl border border-white/10 block">{profile.street1}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[10px] uppercase mb-1">Street 2</span>
                        <span className="text-white font-bold text-sm bg-white/5 p-2.5 rounded-xl border border-white/10 block">{profile.street2 || "—"}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <span className="text-muted-foreground block text-[10px] uppercase mb-1">City</span>
                        <span className="text-white font-bold text-sm bg-white/5 p-2.5 rounded-xl border border-white/10 block">{profile.city}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[10px] uppercase mb-1">Province / State</span>
                        <span className="text-white font-bold text-sm bg-white/5 p-2.5 rounded-xl border border-white/10 block">{profile.province || "—"}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[10px] uppercase mb-1">Postal Code</span>
                        <span className="text-white font-bold text-sm bg-white/5 p-2.5 rounded-xl border border-white/10 block">{profile.postalCode}</span>
                      </div>
                    </div>

                    <div className="w-full max-w-[240px]">
                      <span className="text-muted-foreground block text-[10px] uppercase mb-1">Country</span>
                      <span className="text-white font-bold text-sm bg-white/5 p-2.5 rounded-xl border border-white/10 block">{profile.country}</span>
                    </div>
                  </div>
                </ThreeDCard>

                {/* Contact Block */}
                <ThreeDCard glowColor="white" intensity={8} className="p-6">
                  <h3 className="text-base font-black text-white uppercase tracking-wider mb-6 pb-3 border-b border-white/10 flex items-center gap-2">
                    <Phone className="w-5 h-5 text-white" />
                    Contact Information
                  </h3>

                  <div className="space-y-4 text-xs font-mono">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <span className="text-muted-foreground block text-[10px] uppercase mb-1">Work Phone</span>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-bold text-sm bg-white/5 p-2.5 rounded-xl border border-white/10 flex-1 block">{profile.workPhone}</span>
                          {profile.workPhoneExt && (
                            <span className="text-xs font-mono text-muted-foreground bg-white/5 border border-white/10 px-2.5 py-2.5 rounded-xl">
                              Ext: {profile.workPhoneExt}
                            </span>
                          )}
                        </div>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[10px] uppercase mb-1">Mobile Phone</span>
                        <span className="text-white font-bold text-sm bg-white/5 p-2.5 rounded-xl border border-white/10 block">{profile.mobilePhone}</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase mb-1">Home Phone</span>
                      <span className="text-white font-bold text-sm bg-white/5 p-2.5 rounded-xl border border-white/10 block">{profile.homePhone || "—"}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <span className="text-muted-foreground block text-[10px] uppercase mb-1">Work Email</span>
                        <span className="text-sky-400 font-bold text-sm bg-white/5 p-2.5 rounded-xl border border-white/10 block truncate">{profile.workEmail}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[10px] uppercase mb-1">Home / Personal Email</span>
                        <span className="text-white font-bold text-sm bg-white/5 p-2.5 rounded-xl border border-white/10 block truncate">{profile.personalEmail}</span>
                      </div>
                    </div>
                  </div>
                </ThreeDCard>
              </motion.div>
            )}

            {/* TAB 2: JOB */}
            {activeTab === "job" && (
              <motion.div
                key="tab-job"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <ThreeDCard glowColor="blue" intensity={8} className="p-6">
                  <h3 className="text-base font-black text-white uppercase tracking-wider mb-6 pb-3 border-b border-white/10 flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-blue-400" />
                    Employment Details
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs font-mono">
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase mb-1">Job Title</span>
                      <span className="text-white font-bold text-sm bg-white/5 p-2.5 rounded-xl border border-white/10 block">{profile.jobTitle}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase mb-1">Department</span>
                      <span className="text-blue-400 font-bold text-sm bg-white/5 p-2.5 rounded-xl border border-white/10 block">{profile.department}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase mb-1">Direct Manager</span>
                      <span className="text-white font-bold text-sm bg-white/5 p-2.5 rounded-xl border border-white/10 block">{profile.managerName}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase mb-1">Hire Date</span>
                      <span className="text-white font-bold text-sm bg-white/5 p-2.5 rounded-xl border border-white/10 block">{profile.hireDate}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase mb-1">Employment Type</span>
                      <span className="text-emerald-400 font-bold text-sm bg-white/5 p-2.5 rounded-xl border border-white/10 block">{profile.employmentType}</span>
                    </div>
                  </div>
                </ThreeDCard>
              </motion.div>
            )}

            {/* TAB 3: TIME OFF */}
            {activeTab === "time_off" && (
              <motion.div
                key="tab-time_off"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 gap-6">
                  {timeOffRequests && timeOffRequests.length > 0 ? (
                    timeOffRequests.map((req, i) => (
                      <ThreeDCard key={i} glowColor="blue" intensity={8} className="p-6">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-mono uppercase text-muted-foreground">{req.leave_type || 'Time Off'} Request</span>
                          <span className={`text-[10px] font-mono uppercase px-2 py-1 rounded-full border ${
                            req.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                            req.status === 'rejected' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' :
                            'bg-amber-500/20 text-amber-400 border-amber-500/30'
                          }`}>
                            {req.status || 'Pending'}
                          </span>
                        </div>
                        <div className="text-lg font-black text-white mt-1">{req.reason || 'No reason provided'}</div>
                        <p className="text-xs text-sky-400 font-mono mt-2">
                          {req.start_date ? new Date(req.start_date).toLocaleDateString() : 'N/A'} - {req.end_date ? new Date(req.end_date).toLocaleDateString() : 'N/A'}
                        </p>
                      </ThreeDCard>
                    ))
                  ) : (
                    <div className="text-center p-8 bg-white/5 rounded-xl border border-white/10">
                      <p className="text-muted-foreground font-mono text-xs">No time-off requests found in your history.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* TAB 4: DOCUMENTS (Assigned by Admin - Read-Only for Employee) */}
            {activeTab === "documents" && (
              <motion.div
                key="tab-documents"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <ThreeDCard glowColor="blue" intensity={8} className="p-6">
                  <h3 className="text-base font-black text-white uppercase tracking-wider mb-6 pb-3 border-b border-white/10 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-blue-400" />
                      Assigned Personnel Documents Vault
                    </span>
                    <span className="px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs font-mono font-bold flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-blue-400" /> Read-Only Copy
                    </span>
                  </h3>

                  <div className="space-y-3">
                    {employeeDocs && employeeDocs.length > 0 ? (
                      employeeDocs.map((doc, i) => (
                        <div key={i} className="flex items-center justify-between p-3.5 rounded-xl bg-white/5 border border-white/10 text-xs font-mono">
                          <div className="flex items-center gap-3">
                            <FileText className="w-4 h-4 text-blue-400" />
                            <div>
                              <p className="font-bold text-white">{doc.title || doc.name}</p>
                              <p className="text-[10px] text-muted-foreground">{doc.category || 'Document'} • Uploaded: {new Date(doc.created_at).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => {
                              if (doc.file_url) {
                                window.open(doc.file_url, '_blank');
                              } else {
                                alert("Document file is missing.");
                              }
                            }}
                            className="border-blue-500/40 bg-blue-600/10 hover:bg-blue-600/20 text-blue-300 text-xs"
                          >
                            <Download className="w-3.5 h-3.5 mr-1" /> View
                          </Button>
                        </div>
                      ))
                    ) : (
                      <div className="text-center p-6 bg-white/5 rounded-xl border border-white/10 text-muted-foreground">
                        <p className="text-xs font-mono">No documents found in your vault.</p>
                      </div>
                    )}
                  </div>
                </ThreeDCard>
              </motion.div>
            )}

            {/* TAB 5: PERFORMANCE */}
            {activeTab === "performance" && (
              <motion.div
                key="tab-performance"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <ThreeDCard glowColor="emerald" intensity={8} className="p-6">
                  <h3 className="text-base font-black text-white uppercase tracking-wider mb-6 pb-3 border-b border-white/10 flex items-center gap-2">
                    <Target className="w-5 h-5 text-emerald-400" />
                    Performance Evaluation
                  </h3>

                  {performance ? (
                    <>
                      <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 mb-6">
                        <div>
                          <span className="text-xs font-mono uppercase text-muted-foreground">Latest Evaluation Score</span>
                          <div className="text-3xl font-black text-white mt-1">{performance.score ? `${performance.score} / 5.0` : 'N/A'}</div>
                        </div>
                        {performance.rating && (
                          <span className={`px-3 py-1 rounded-full font-mono text-xs font-bold border ${
                            performance.rating.toLowerCase().includes('exceed') ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' :
                            performance.rating.toLowerCase().includes('meet') ? 'bg-blue-500/20 text-blue-400 border-blue-500/40' :
                            'bg-amber-500/20 text-amber-400 border-amber-500/40'
                          }`}>
                            {performance.rating}
                          </span>
                        )}
                      </div>
                      {performance.comments && (
                        <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-sm text-muted-foreground">
                          {performance.comments}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center p-8 bg-white/5 rounded-xl border border-white/10">
                      <p className="text-muted-foreground font-mono text-xs">No recent performance evaluations found.</p>
                    </div>
                  )}
                </ThreeDCard>
              </motion.div>
            )}

            {/* TAB 6: EMERGENCY CONTACT */}
            {activeTab === "emergency" && (
              <motion.div
                key="tab-emergency"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <ThreeDCard glowColor="blue" intensity={8} className="p-6">
                  <h3 className="text-base font-black text-white uppercase tracking-wider mb-6 pb-3 border-b border-white/10 flex items-center gap-2">
                    <Heart className="w-5 h-5 text-rose-400" />
                    Primary Emergency Contact
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs font-mono">
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase mb-1">Contact Person Name</span>
                      <span className="text-white font-bold text-sm bg-white/5 p-2.5 rounded-xl border border-white/10 block">{profile.emergencyName}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase mb-1">Relationship</span>
                      <span className="text-rose-400 font-bold text-sm bg-white/5 p-2.5 rounded-xl border border-white/10 block">{profile.emergencyRelationship}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase mb-1">Phone Number</span>
                      <span className="text-white font-bold text-sm bg-white/5 p-2.5 rounded-xl border border-white/10 block">{profile.emergencyPhone}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase mb-1">Email Address</span>
                      <span className="text-white font-bold text-sm bg-white/5 p-2.5 rounded-xl border border-white/10 block">{profile.emergencyEmail}</span>
                    </div>
                  </div>
                </ThreeDCard>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>

      {/* Edit Profile Dynamic Modal with Enforced Read-Only / Editable Fields */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-[680px]">
          <form onSubmit={handleSaveProfile}>
            <DialogHeader>
              <DialogTitle>Edit Personal Information</DialogTitle>
              <DialogDescription>
                Update your personal employee profile details. System administrative fields (Employee #, Manager, Department) are read-only.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2 text-xs font-mono">
              
              {/* Read-Only System Fields Banner */}
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 grid grid-cols-3 gap-3 text-[11px]">
                <div>
                  <span className="text-muted-foreground block text-[9px] uppercase flex items-center gap-1">
                    Employee # <Lock className="w-2.5 h-2.5 text-muted-foreground/80" />
                  </span>
                  <span className="text-white font-bold">{formData.employeeNumber}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[9px] uppercase flex items-center gap-1">
                    Job Title <Lock className="w-2.5 h-2.5 text-muted-foreground/80" />
                  </span>
                  <span className="text-sky-400 font-bold truncate block">{formData.jobTitle}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[9px] uppercase flex items-center gap-1">
                    Direct Manager <Lock className="w-2.5 h-2.5 text-muted-foreground/80" />
                  </span>
                  <span className="text-white font-bold truncate block">{formData.managerName}</span>
                </div>
              </div>

              {/* Editable Name Breakdown */}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="editFirstName">First Name*</Label>
                  <Input 
                    id="editFirstName" 
                    required
                    value={formData.firstName} 
                    onChange={e => setFormData({ ...formData, firstName: e.target.value })} 
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="editMiddleName">Middle Name</Label>
                  <Input 
                    id="editMiddleName" 
                    value={formData.middleName} 
                    onChange={e => setFormData({ ...formData, middleName: e.target.value })} 
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="editLastName">Last Name*</Label>
                  <Input 
                    id="editLastName" 
                    required
                    value={formData.lastName} 
                    onChange={e => setFormData({ ...formData, lastName: e.target.value })} 
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="editBirthDate">Birth Date</Label>
                  <Input 
                    id="editBirthDate" 
                    type="date"
                    value={formData.birthDate} 
                    onChange={e => setFormData({ ...formData, birthDate: e.target.value })} 
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="editSSN">SSN</Label>
                  <Input 
                    id="editSSN" 
                    value={formData.ssn} 
                    onChange={e => setFormData({ ...formData, ssn: e.target.value })} 
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="editGender">Gender</Label>
                  <select 
                    id="editGender" 
                    value={formData.gender} 
                    onChange={e => setFormData({ ...formData, gender: e.target.value })}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="Male" className="bg-background text-foreground">Male</option>
                    <option value="Female" className="bg-background text-foreground">Female</option>
                    <option value="Other" className="bg-background text-foreground">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="editMarital">Marital Status</Label>
                  <select 
                    id="editMarital" 
                    value={formData.maritalStatus} 
                    onChange={e => setFormData({ ...formData, maritalStatus: e.target.value })}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="Single" className="bg-background text-foreground">Single</option>
                    <option value="Married" className="bg-background text-foreground">Married</option>
                    <option value="Divorced" className="bg-background text-foreground">Divorced</option>
                    <option value="Widowed" className="bg-background text-foreground">Widowed</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="editNationalId">National ID / CNIC</Label>
                  <Input 
                    id="editNationalId" 
                    value={formData.nationalId} 
                    onChange={e => setFormData({ ...formData, nationalId: e.target.value })} 
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="editBirthPlace">Place of Birth</Label>
                  <Input 
                    id="editBirthPlace" 
                    value={formData.placeOfBirth} 
                    onChange={e => setFormData({ ...formData, placeOfBirth: e.target.value })} 
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-white/10 font-bold text-sky-400 uppercase text-[10px]">
                Address & Contact Details
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="editStreet1">Street 1</Label>
                  <Input 
                    id="editStreet1" 
                    value={formData.street1} 
                    onChange={e => setFormData({ ...formData, street1: e.target.value })} 
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="editStreet2">Street 2</Label>
                  <Input 
                    id="editStreet2" 
                    value={formData.street2} 
                    onChange={e => setFormData({ ...formData, street2: e.target.value })} 
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="editCity">City</Label>
                  <Input 
                    id="editCity" 
                    value={formData.city} 
                    onChange={e => setFormData({ ...formData, city: e.target.value })} 
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="editProvince">Province / State</Label>
                  <Input 
                    id="editProvince" 
                    value={formData.province} 
                    onChange={e => setFormData({ ...formData, province: e.target.value })} 
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="editPostal">Postal Code</Label>
                  <Input 
                    id="editPostal" 
                    value={formData.postalCode} 
                    onChange={e => setFormData({ ...formData, postalCode: e.target.value })} 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="editWorkPhone">Work Phone</Label>
                  <Input 
                    id="editWorkPhone" 
                    value={formData.workPhone} 
                    onChange={e => setFormData({ ...formData, workPhone: e.target.value })} 
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="editMobilePhone">Mobile Phone</Label>
                  <Input 
                    id="editMobilePhone" 
                    value={formData.mobilePhone} 
                    onChange={e => setFormData({ ...formData, mobilePhone: e.target.value })} 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="editWorkEmail">Work Email</Label>
                  <Input 
                    id="editWorkEmail" 
                    type="email"
                    value={formData.workEmail} 
                    onChange={e => setFormData({ ...formData, workEmail: e.target.value })} 
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="editPersonalEmail">Personal / Home Email</Label>
                  <Input 
                    id="editPersonalEmail" 
                    type="email"
                    value={formData.personalEmail} 
                    onChange={e => setFormData({ ...formData, personalEmail: e.target.value })} 
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-white/10 font-bold text-rose-400 uppercase text-[10px]">
                Emergency Contact Details
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="editEmergencyName">Contact Person Name</Label>
                  <Input 
                    id="editEmergencyName" 
                    value={formData.emergencyName} 
                    onChange={e => setFormData({ ...formData, emergencyName: e.target.value })} 
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="editEmergencyPhone">Emergency Phone</Label>
                  <Input 
                    id="editEmergencyPhone" 
                    value={formData.emergencyPhone} 
                    onChange={e => setFormData({ ...formData, emergencyPhone: e.target.value })} 
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-white/10">
              <Button type="button" variant="outline" onClick={() => setShowEditModal(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-500 text-white font-bold">
                {saving ? "Saving Changes..." : "Save Profile"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
