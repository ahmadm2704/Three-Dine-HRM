"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  FolderOpen, 
  FileText, 
  Download, 
  Upload, 
  ShieldCheck, 
  UserCheck, 
  Trash2, 
  Eye, 
  Lock, 
  Building,
  CheckCircle2
} from "lucide-react";
import { ThreeDPageHeader } from "@/components/ui/ThreeDPageHeader";
import { ThreeDCard } from "@/components/ui/ThreeDCard";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DocumentItem {
  id: string;
  title: string;
  category: string;
  size: string;
  date: string;
  assignedToEmail: string; // 'all' or specific employee email
  assignedToName: string;
  fileDataUrl?: string;
  uploadedBy: string;
}

const DEFAULT_DOCUMENTS: DocumentItem[] = [
  {
    id: "doc-101",
    title: "Three_Dine_Employee_Handbook_2026.pdf",
    category: "Policy & Handbook",
    size: "4.2 MB",
    date: "Jan 10, 2026",
    assignedToEmail: "all",
    assignedToName: "All Employees (Company-wide)",
    uploadedBy: "Ali Danish (Super Admin)"
  },
  {
    id: "doc-102",
    title: "Security_Compliance_NDA_v4.pdf",
    category: "NDA & Compliance",
    size: "2.8 MB",
    date: "Feb 14, 2026",
    assignedToEmail: "all",
    assignedToName: "All Employees (Company-wide)",
    uploadedBy: "Ali Danish (Super Admin)"
  },
  {
    id: "doc-103",
    title: "Employment_Contract_Ahmad_Masood.pdf",
    category: "Employment Contract",
    size: "1.9 MB",
    date: "Jan 10, 2024",
    assignedToEmail: "ahmad.masood@threedinecorporation.com",
    assignedToName: "Ahmad Masood",
    uploadedBy: "Ali Danish (Super Admin)"
  },
  {
    id: "doc-104",
    title: "Employment_Contract_Maahin_Ali.pdf",
    category: "Employment Contract",
    size: "2.1 MB",
    date: "Mar 15, 2023",
    assignedToEmail: "maahin.ali@threedinecorporation.com",
    assignedToName: "Maahin Ali",
    uploadedBy: "Ali Danish (Super Admin)"
  }
];

export default function Documents() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  
  // Modal State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    category: "Employment Contract",
    assignedToEmail: "all",
    file: null as File | null
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load User, Employees, and Documents on Mount
  useEffect(() => {
    // 1. Read logged-in user
    const savedUser = localStorage.getItem("threedine_user");
    let userEmail = "admin@threedinecorporation.com";
    let isSuperAdmin = true;

    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setCurrentUser(parsed);
        if (parsed.email) userEmail = parsed.email;
        isSuperAdmin = parsed.role === 'super_admin' || parsed.role === 'hr_admin';
        setIsAdmin(isSuperAdmin);
      } catch (e) {}
    } else {
      setIsAdmin(true);
    }

    // 2. Fetch employee list for assigning documents
    async function fetchEmployees() {
      try {
        const res = await fetch('/api/employees');
        if (res.ok) {
          const { employees: apiEmployees } = await res.json();
          setEmployees(apiEmployees || []);
        }
      } catch (err) {}
    }
    fetchEmployees();

    // 3. Load stored documents from localStorage or initialize with defaults
    const storedDocs = localStorage.getItem("threedine_documents");
    if (storedDocs) {
      try {
        setDocuments(JSON.parse(storedDocs));
      } catch (e) {
        setDocuments(DEFAULT_DOCUMENTS);
      }
    } else {
      setDocuments(DEFAULT_DOCUMENTS);
      localStorage.setItem("threedine_documents", JSON.stringify(DEFAULT_DOCUMENTS));
    }
  }, []);

  // Filter documents based on role & assignment
  const userEmail = currentUser?.email?.toLowerCase() || "admin@threedinecorporation.com";
  const visibleDocuments = isAdmin 
    ? documents 
    : documents.filter(doc => doc.assignedToEmail === 'all' || doc.assignedToEmail?.toLowerCase() === userEmail);

  // Upload & Assign Document Handler
  const handleUploadDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;

    let targetName = "All Employees (Company-wide)";
    if (formData.assignedToEmail !== "all") {
      const targetEmp = employees.find(emp => emp.email?.toLowerCase() === formData.assignedToEmail.toLowerCase());
      if (targetEmp) {
        targetName = `${targetEmp.first_name} ${targetEmp.last_name}`;
      }
    }

    const newDoc: DocumentItem = {
      id: `doc-${Date.now()}`,
      title: formData.title.endsWith('.pdf') ? formData.title : `${formData.title}.pdf`,
      category: formData.category,
      size: formData.file ? `${(formData.file.size / (1024 * 1024)).toFixed(1)} MB` : "1.2 MB",
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      assignedToEmail: formData.assignedToEmail,
      assignedToName: targetName,
      uploadedBy: currentUser ? `${currentUser.firstName || 'Ali'} ${currentUser.lastName || 'Danish'}` : "Ali Danish (Super Admin)"
    };

    const updated = [newDoc, ...documents];
    setDocuments(updated);
    localStorage.setItem("threedine_documents", JSON.stringify(updated));

    setShowUploadModal(false);
    setFormData({ title: "", category: "Employment Contract", assignedToEmail: "all", file: null });
  };

  // Delete Document (Admin Only)
  const handleDeleteDocument = (docId: string) => {
    if (confirm("Are you sure you want to remove this document from the employee vault?")) {
      const updated = documents.filter(d => d.id !== docId);
      setDocuments(updated);
      localStorage.setItem("threedine_documents", JSON.stringify(updated));
    }
  };

  // Download / View Document Trigger
  const handleDownload = (doc: DocumentItem) => {
    // Generate mock text blob download for verification
    const blob = new Blob([`THREE DINE CORPORATION OFFICIAL DOCUMENT\nTitle: ${doc.title}\nCategory: ${doc.category}\nAssigned To: ${doc.assignedToName}\nUploaded By: ${doc.uploadedBy}\nDate: ${doc.date}\nStatus: Verified Read-Only Copy`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = doc.title.replace('.pdf', '.txt');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6 pb-12">
      <ThreeDPageHeader
        title="Document Management & Vault"
        subtitle="Access encrypted corporate policies, employment contracts, and compliance forms."
        badge="Secure Storage"
      >
        {isAdmin && (
          <Button 
            onClick={() => setShowUploadModal(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-[0_0_20px_rgba(37,99,235,0.4)] rounded-2xl text-xs uppercase tracking-wider border border-blue-400/40 h-11 px-5"
          >
            <Upload className="mr-2 h-4 w-4" /> Attach & Assign Document
          </Button>
        )}
      </ThreeDPageHeader>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        <ThreeDCard glowColor="blue">
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-blue-600/15 border border-blue-500/30 text-blue-400">
              <FolderOpen className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white">Company Vault & Handbooks</h3>
              <p className="text-xs text-sky-400 font-mono mt-0.5">
                {documents.filter(d => d.assignedToEmail === 'all').length} Company-wide Documents
              </p>
            </div>
          </div>
        </ThreeDCard>

        <ThreeDCard glowColor="emerald">
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white">Assigned Employee Contracts</h3>
              <p className="text-xs text-emerald-400 font-mono mt-0.5">
                {documents.filter(d => d.assignedToEmail !== 'all').length} Targeted Personnel Documents
              </p>
            </div>
          </div>
        </ThreeDCard>
      </div>

      {/* Main Document Repository Table Card */}
      <ThreeDCard glowColor="blue">
        <div className="p-2">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
            <div>
              <h3 className="text-lg font-black text-white uppercase">Corporate File Repository</h3>
              <p className="text-xs text-muted-foreground font-mono">
                {isAdmin ? "Admin Overview: All assigned and company-wide documents" : "Your Personnel Vault: View-Only documents assigned to you by Admin"}
              </p>
            </div>
            {!isAdmin && (
              <span className="px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs font-mono font-bold flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-blue-400" /> View-Only Access
              </span>
            )}
          </div>

          {visibleDocuments.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-white/10 rounded-2xl">
              <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm font-bold text-white">No documents assigned yet</p>
              <p className="text-xs text-muted-foreground font-mono mt-1">Check back later or contact your HR Administrator.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {visibleDocuments.map((doc) => (
                <div key={doc.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:border-blue-500/40 transition-all duration-300 gap-4">
                  
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="p-2.5 rounded-xl bg-blue-600/15 text-blue-400 border border-blue-500/30 shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-white text-sm truncate">{doc.title}</h4>
                      <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground font-mono mt-0.5">
                        <span className="text-sky-400 font-bold">{doc.category}</span>
                        <span>•</span>
                        <span>{doc.size}</span>
                        <span>•</span>
                        <span>Uploaded {doc.date}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 flex-wrap">
                    {/* Assigned Personnel Badge */}
                    <div className="px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-xs font-mono">
                      <span className="text-muted-foreground text-[10px] uppercase block">Assigned To</span>
                      <span className="text-emerald-400 font-bold">{doc.assignedToName}</span>
                    </div>

                    {/* View / Download Button (Read-Only for Employee) */}
                    <Button 
                      onClick={() => handleDownload(doc)}
                      variant="outline" 
                      className="border-blue-500/40 bg-blue-600/10 hover:bg-blue-600/20 text-blue-300 font-mono text-xs"
                    >
                      <Download className="w-3.5 h-3.5 mr-1.5" /> Download
                    </Button>

                    {/* Admin Delete Action */}
                    {isAdmin && (
                      <Button 
                        onClick={() => handleDeleteDocument(doc.id)}
                        variant="ghost" 
                        size="icon" 
                        className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 h-9 w-9 rounded-xl"
                        title="Remove Document"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </ThreeDCard>

      {/* Admin Upload & Assign Document Modal */}
      <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
        <DialogContent className="sm:max-w-[540px]">
          <form onSubmit={handleUploadDocument}>
            <DialogHeader>
              <DialogTitle>Attach & Assign Document</DialogTitle>
              <DialogDescription>
                Upload a document and assign it to a specific employee or company-wide. Assigned documents are read-only for employees.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4 text-xs font-mono">
              <div className="space-y-1.5">
                <Label htmlFor="docTitle">Document Title</Label>
                <Input 
                  id="docTitle" 
                  required
                  placeholder="e.g. Employment_Contract_Ahmad_Masood.pdf"
                  value={formData.title} 
                  onChange={e => setFormData({ ...formData, title: e.target.value })} 
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="docCategory">Document Category</Label>
                <select 
                  id="docCategory" 
                  value={formData.category} 
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="Employment Contract" className="bg-background text-foreground">Employment Contract</option>
                  <option value="NDA & Compliance" className="bg-background text-foreground">NDA & Compliance</option>
                  <option value="Policy & Handbook" className="bg-background text-foreground">Policy & Handbook</option>
                  <option value="Tax & Payroll" className="bg-background text-foreground">Tax & Payroll</option>
                  <option value="Performance Review" className="bg-background text-foreground">Performance Review</option>
                  <option value="ID & Verification" className="bg-background text-foreground">ID & Verification</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="assignEmp">Assign To Specific Employee</Label>
                <select 
                  id="assignEmp" 
                  value={formData.assignedToEmail} 
                  onChange={e => setFormData({ ...formData, assignedToEmail: e.target.value })}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="all" className="bg-background text-foreground">All Employees (Company-wide)</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.email} className="bg-background text-foreground">
                      {emp.first_name} {emp.last_name} ({emp.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="fileInput">Upload Document File</Label>
                <Input 
                  id="fileInput" 
                  type="file" 
                  ref={fileInputRef}
                  onChange={e => setFormData({ ...formData, file: e.target.files?.[0] || null })}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-white/10">
              <Button type="button" variant="outline" onClick={() => setShowUploadModal(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white font-bold">
                Assign Document
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
