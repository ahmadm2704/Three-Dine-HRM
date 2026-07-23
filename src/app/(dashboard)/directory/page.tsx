"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, Plus, Filter, MoreHorizontal, Loader2, Mail, Building, Briefcase, Send, Users, ShieldCheck } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { ThreeDPageHeader } from "@/components/ui/ThreeDPageHeader";
import { ThreeDCard } from "@/components/ui/ThreeDCard";


export default function Directory() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Add Employee Form State
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ firstName: "", lastName: "", email: "", personalEmail: "", jobTitle: "", department: "", managerId: "", startDate: "", employeeNumber: "", accessLevel: "employee", password: "" });

  const [editEmployee, setEditEmployee] = useState<any | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    async function fetchEmployees() {
      try {
        const response = await fetch('/api/employees');
        if (response.ok) {
          const { employees: data } = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            setEmployees(data);
            return;
          }
        }
      } catch (err) {
        console.error("Failed to fetch employees:", err);
      } finally {
        setLoading(false);
      }

      // Default Super Admin account
      setEmployees([
        { 
          id: "admin-super-001", 
          first_name: "Ali", 
          last_name: "Danish", 
          email: "admin@threedinecorporation.com", 
          job_title: "Chief Executive Officer", 
          employment_status: "active", 
          employment_type: "full-time", 
          accessLevel: "super_admin", 
          departments: { name: "Leadership" }, 
          custom_fields: { employee_number: "001" }, 
          start_date: "2023-01-01" 
        }
      ]);
    }
    fetchEmployees();
  }, []);

  const filteredEmployees = employees.filter(emp => {
    const fullName = `${emp.first_name} ${emp.last_name}`.toLowerCase();
    const role = (emp.job_title || "").toLowerCase();
    const dept = (emp.departments?.name || "").toLowerCase();
    const search = searchTerm.toLowerCase();
    const matchesSearch = fullName.includes(search) || role.includes(search) || dept.includes(search);
    const matchesStatus = statusFilter === "all" || emp.employment_status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);
    
    try {
      // Use server-side API to insert employee (bypasses RLS)
      const response = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          jobTitle: formData.jobTitle,
          department: formData.department,
          managerId: formData.managerId || null,
          startDate: formData.startDate || undefined,
          employeeNumber: formData.employeeNumber || undefined,
          personalEmail: formData.personalEmail || undefined,
          accessLevel: formData.accessLevel,
          password: formData.password || undefined,
          adminEmail: JSON.parse(localStorage.getItem('threedine_user') || '{}')?.email || 'admin@threedinecorporation.com',
        }),
      });

      const result = await response.json();
      let newEmpData: any = null;

      const userTypedPassword = formData.password ? formData.password.trim() : '';
      const userPersonalEmail = formData.personalEmail ? formData.personalEmail.trim() : '';

      if (!response.ok || !result.employee) {
        alert(`Database Error: ${result.error || 'Failed to insert employee into Supabase database'}`);
        setIsAdding(false);
        return;
      }

      newEmpData = result.employee;
      const finalRealPassword = result.generatedPassword || userTypedPassword || `TD-${Math.random().toString(36).slice(-6)}!`;

      // Refetch latest live database records directly from Supabase
      const freshRes = await fetch('/api/employees');
      if (freshRes.ok) {
        const freshData = await freshRes.json();
        if (freshData.employees) setEmployees(freshData.employees);
      } else {
        setEmployees(prev => [newEmpData, ...prev]);
      }

      setIsAdding(false);
      setShowAddDialog(false);
      setFormData({ firstName: "", lastName: "", email: "", personalEmail: "", jobTitle: "", department: "", managerId: "", startDate: "", employeeNumber: "", accessLevel: "employee", password: "" });

      // Send email via our API route with exact real password
      fetch('/api/send-credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: newEmpData.first_name,
          email: newEmpData.email,
          personalEmail: userPersonalEmail || newEmpData.email,
          password: finalRealPassword,
          role: newEmpData.job_title,
          department: newEmpData.departments ? (Array.isArray(newEmpData.departments) ? newEmpData.departments[0]?.name : (newEmpData.departments as any).name) : 'General'
        }),
      }).then(async (res) => {
        const mailRes = await res.json();
        
        if (!res.ok) {
          alert(`Success! Employee created: ${newEmpData.first_name}\n\nLogin Email: ${newEmpData.email}\nLogin Password: ${finalRealPassword}`);
        } else {
          alert(`Success! Profile created for ${newEmpData.first_name}.
          
LOGIN CREDENTIALS DELIVERED IN EMAIL:
Email: ${newEmpData.email}
Password: ${finalRealPassword}`);
        }
      }).catch(() => {
        alert(`Success! Profile created for ${newEmpData.first_name}.\nEmail: ${newEmpData.email}\nPassword: ${finalRealPassword}`);
      });
    } catch (err) {
      alert("Failed to add employee to the database.");
      setIsAdding(false);
    }
  };

  const handleDelete = async (id: string | number) => {
    if (confirm("Are you sure you want to permanently delete this employee? This action cannot be undone.")) {
      try {
        const response = await fetch(`/api/employees/${id}`, { method: 'DELETE' });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to delete employee');
        }
        
        // Track deleted IDs in localStorage for mock data synchronization across pages
        const deletedMockIds = JSON.parse(localStorage.getItem('deleted_mock_ids') || '[]');
        if (!deletedMockIds.includes(String(id))) {
          localStorage.setItem('deleted_mock_ids', JSON.stringify([...deletedMockIds, String(id)]));
        }
        
        setEmployees(prev => prev.filter(emp => String(emp.id) !== String(id)));
      } catch (err: any) {
        console.error(err);
        alert(err.message || "Failed to delete employee from database.");
      }
    }
  };

  const handleDeactivate = async (id: string | number) => {
    const emp = employees.find(e => e.id === id);
    if (!emp) return;
    
    if (confirm("Are you sure you want to change this employee's status?")) {
      try {
        const newStatus = emp.employment_status === 'active' ? 'inactive' : 'active';
        
        await fetch(`/api/employees/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ employment_status: newStatus }),
        });
        
        setEmployees(prev => prev.map(e => {
          if (e.id === id) return { ...e, employment_status: newStatus };
          return e;
        }));
      } catch (err) {
        console.error(err);
        alert("Failed to update status.");
      }
    }
  };

  const handleEditEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editEmployee) return;
    
    setIsEditing(true);
    
    try {
      const response = await fetch(`/api/employees/${editEmployee.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: editEmployee.first_name,
          last_name: editEmployee.last_name,
          email: editEmployee.email,
          job_title: editEmployee.job_title,
          department_name: editEmployee.department_name || undefined,
          accessLevel: editEmployee.accessLevel || undefined,
          manager_id: editEmployee.manager_id || null,
          start_date: editEmployee.start_date || undefined,
          personal_email: editEmployee.personal_email || editEmployee.custom_fields?.personal_email || undefined,
          employee_number: editEmployee.employee_number || editEmployee.custom_fields?.employee_number || undefined,
          adminEmail: JSON.parse(localStorage.getItem('threedine_user') || '{}')?.email,
        }),
      });

      const result = await response.json();

      if (response.ok && result.employee) {
        const data = result.employee;
        setEmployees(prev => prev.map(emp => {
          if (emp.id === editEmployee.id) {
            return {
              ...emp,
              first_name: data.first_name,
              last_name: data.last_name,
              email: data.email,
              job_title: data.job_title,
              departments: { name: data.departments ? (Array.isArray(data.departments) ? data.departments[0]?.name : (data.departments as any).name) : '' }
            };
          }
          return emp;
        }));
      } else {
        // Fallback: update local state even if DB fails
        setEmployees(prev => prev.map(emp => {
          if (emp.id === editEmployee.id) {
            return {
              ...emp,
              first_name: editEmployee.first_name,
              last_name: editEmployee.last_name,
              email: editEmployee.email,
              job_title: editEmployee.job_title,
            };
          }
          return emp;
        }));
      }
      
      setIsEditing(false);
      setEditEmployee(null);
    } catch (err) {
      console.error(err);
      alert("Failed to update employee.");
      setIsEditing(false);
    }
  };

  return (
    <div className="space-y-6">
      <ThreeDPageHeader
        title="Employee Directory"
        subtitle="Manage organizational structure, access levels, and active personnel."
        badge="Personnel Registry"
      >
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-[0_0_20px_rgba(37,99,235,0.4)] rounded-2xl text-xs uppercase tracking-wider border border-blue-400/40 h-11 px-5">
              <Plus className="mr-2 h-4 w-4" /> Add Employee
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <form onSubmit={handleAddEmployee}>
              <DialogHeader>
                <DialogTitle>Create Employee Profile</DialogTitle>
                <DialogDescription>
                  Add a new member to the organization. An email invitation will be sent automatically.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input 
                      id="firstName" 
                      required 
                      value={formData.firstName}
                      onChange={e => setFormData({...formData, firstName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input 
                      id="lastName" 
                      required 
                      value={formData.lastName}
                      onChange={e => setFormData({...formData, lastName: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Work Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="email" 
                        type="email" 
                        className="pl-9" 
                        placeholder="employee@threedine.com" 
                        required 
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="personalEmail">Personal Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="personalEmail" 
                        type="email" 
                        className="pl-9" 
                        placeholder="personal@gmail.com" 
                        value={formData.personalEmail}
                        onChange={e => setFormData({...formData, personalEmail: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="password">Login Password (Optional)</Label>
                    <div className="relative">
                      <Input 
                        id="password" 
                        type="text" 
                        className="" 
                        placeholder="Leave blank to auto-generate secure password" 
                        value={formData.password}
                        onChange={e => setFormData({...formData, password: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="jobTitle">Job Title</Label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="jobTitle" 
                        className="pl-9" 
                        placeholder="Software Engineer" 
                        required 
                        value={formData.jobTitle}
                        onChange={e => setFormData({...formData, jobTitle: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <div className="relative">
                      <Building className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground z-10" />
                      <select 
                        required
                        value={formData.department}
                        onChange={e => setFormData({...formData, department: e.target.value})}
                        className="flex h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      >
                        <option value="" disabled className="bg-background text-foreground">Select Dept</option>
                        <option value="Leadership" className="bg-background text-foreground">Leadership</option>
                        <option value="Top Management" className="bg-background text-foreground">Top Management</option>
                        <option value="IT Team" className="bg-background text-foreground">IT Team</option>
                        <option value="Support" className="bg-background text-foreground">Support</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="employeeNumber">Employee #</Label>
                    <Input 
                      id="employeeNumber" 
                      placeholder="e.g. 508" 
                      value={formData.employeeNumber}
                      onChange={e => setFormData({...formData, employeeNumber: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Hiring Date</Label>
                    <Input 
                      id="startDate" 
                      type="date"
                      value={formData.startDate}
                      onChange={e => setFormData({...formData, startDate: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="managerId">Reports To (Manager)</Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground z-10" />
                    <select 
                      value={formData.managerId}
                      onChange={e => setFormData({...formData, managerId: e.target.value})}
                      className="flex h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      <option value="" className="bg-background text-foreground">No Manager (Top Level)</option>
                      {employees.map(emp => (
                        <option key={emp.id} value={emp.id} className="bg-background text-foreground">
                          {emp.first_name} {emp.last_name} - {emp.job_title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accessLevel">System Access Level</Label>
                  <div className="relative">
                    <ShieldCheck className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground z-10" />
                    <select 
                      required
                      value={formData.accessLevel}
                      onChange={e => setFormData({...formData, accessLevel: e.target.value})}
                      className="flex h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      <option value="employee" className="bg-background text-foreground">Normal Employee</option>
                      <option value="manager" className="bg-background text-foreground">Manager</option>
                      <option value="hr_admin" className="bg-background text-foreground">HR Admin</option>
                      <option value="super_admin" className="bg-background text-foreground">Super Admin</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
                <Button type="submit" disabled={isAdding}>
                  {isAdding ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...</> : "Create Profile"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </ThreeDPageHeader>

        <Dialog open={!!editEmployee} onOpenChange={(open) => !open && setEditEmployee(null)}>
          <DialogContent className="sm:max-w-[500px]">
            <form onSubmit={handleEditEmployee}>
              <DialogHeader>
                <DialogTitle>Edit Employee Profile</DialogTitle>
                <DialogDescription>Update information for this team member.</DialogDescription>
              </DialogHeader>
              
              {editEmployee && (
                <div className="grid gap-4 py-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="editFirstName">First Name</Label>
                      <Input 
                        id="editFirstName" 
                        required 
                        value={editEmployee.first_name}
                        onChange={e => setEditEmployee({...editEmployee, first_name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="editLastName">Last Name</Label>
                      <Input 
                        id="editLastName" 
                        required 
                        value={editEmployee.last_name}
                        onChange={e => setEditEmployee({...editEmployee, last_name: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="editEmail">Email Address</Label>
                    <Input 
                      id="editEmail" 
                      type="email" 
                      required 
                      value={editEmployee.email}
                      onChange={e => setEditEmployee({...editEmployee, email: e.target.value})}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="editPersonalEmail">Personal Email</Label>
                      <Input 
                        id="editPersonalEmail" 
                        type="email" 
                        value={editEmployee.personal_email || editEmployee.custom_fields?.personal_email || ""}
                        onChange={e => setEditEmployee({...editEmployee, personal_email: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="editEmployeeNumber">Employee #</Label>
                      <Input 
                        id="editEmployeeNumber" 
                        value={editEmployee.employee_number || editEmployee.custom_fields?.employee_number || ""}
                        onChange={e => setEditEmployee({...editEmployee, employee_number: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="editJobTitle">Job Title</Label>
                      <Input 
                        id="editJobTitle" 
                        required 
                        value={editEmployee.job_title}
                        onChange={e => setEditEmployee({...editEmployee, job_title: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="editDepartment">Department</Label>
                      <Input 
                        id="editDepartment" 
                        required 
                        value={editEmployee.department_name || editEmployee.departments?.name || ""}
                        onChange={e => setEditEmployee({...editEmployee, department_name: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="editStartDate">Hiring Date</Label>
                      <Input 
                        id="editStartDate" 
                        type="date"
                        value={editEmployee.start_date || ""}
                        onChange={e => setEditEmployee({...editEmployee, start_date: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="editManagerId">Reports To (Manager)</Label>
                      <select 
                        id="editManagerId"
                        value={editEmployee.manager_id || ""}
                        onChange={e => setEditEmployee({...editEmployee, manager_id: e.target.value})}
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      >
                        <option value="" className="bg-background text-foreground text-muted-foreground">No Manager (Top Level)</option>
                        {employees.filter(emp => emp.id !== editEmployee.id).map(emp => (
                          <option key={emp.id} value={emp.id} className="bg-background text-foreground">
                            {emp.first_name} {emp.last_name} ({emp.job_title})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="editAccessLevel">System Access Level (Role)</Label>
                    <select 
                      id="editAccessLevel"
                      value={editEmployee.accessLevel || 'employee'}
                      onChange={e => setEditEmployee({...editEmployee, accessLevel: e.target.value})}
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      <option value="employee" className="bg-background text-foreground">Normal Employee</option>
                      <option value="manager" className="bg-background text-foreground">Manager</option>
                      <option value="hr_admin" className="bg-background text-foreground">HR Admin</option>
                      <option value="super_admin" className="bg-background text-foreground">Super Admin</option>
                    </select>
                  </div>
                  
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setEditEmployee(null)}>Cancel</Button>
                    <Button type="submit" disabled={isEditing}>
                      {isEditing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : "Save Changes"}
                    </Button>
                  </div>
                </div>
              )}
            </form>
          </DialogContent>
        </Dialog>

      <ThreeDCard glowColor="blue">
        <Card className="bg-transparent border-none shadow-none">
        <CardHeader className="pb-3 border-b bg-muted/20">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by name, role, or department..."
                className="pl-9 bg-background"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full sm:w-auto bg-background">
                    <Filter className="mr-2 h-4 w-4" /> 
                    {statusFilter === 'all' ? 'Filter Structure' : `Status: ${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}`}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px]">
                  <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setStatusFilter('all')} className={statusFilter === 'all' ? 'bg-muted' : ''}>
                    All Employees
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('active')} className={statusFilter === 'active' ? 'bg-muted' : ''}>
                    Active Only
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('inactive')} className={statusFilter === 'inactive' ? 'bg-muted' : ''}>
                    Inactive / Deactivated
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/10">
                <TableHead className="pl-6">Employee Profile</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Organization Dept</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                  </TableCell>
                </TableRow>
              ) : filteredEmployees.map((employee) => (
                <TableRow key={employee.id} className="hover:bg-muted/30 transition-colors group">
                  <TableCell className="pl-6 py-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-10 w-10 border shadow-sm overflow-hidden">
                        {employee.avatar_url || employee.photo_url ? (
                          <img src={employee.avatar_url || employee.photo_url} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                            {employee.first_name[0]}{employee.last_name[0]}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div>
                        <div className="font-semibold text-foreground/90">{employee.first_name} {employee.last_name}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3" /> {employee.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{employee.job_title || 'N/A'}</div>
                    <div className="text-xs uppercase tracking-wider font-semibold mt-1 text-primary/70">
                      {employee.accessLevel?.replace('_', ' ') || 'EMPLOYEE'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-muted-foreground" />
                      {employee.departments?.name || 'N/A'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                      employee.employment_status === 'active' ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${employee.employment_status === 'active' ? 'bg-success' : 'bg-warning'}`}></span>
                      {employee.employment_status.charAt(0).toUpperCase() + employee.employment_status.slice(1)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[160px]">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => router.push('/org-chart')}>
                          View Org Chart
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setEditEmployee(employee)}>
                          Edit Profile
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className={employee.employment_status === 'active' ? "text-destructive" : "text-emerald-600"}
                          onClick={() => handleDeactivate(employee.id)}
                        >
                          {employee.employment_status === 'active' ? 'Deactivate' : 'Reactivate'}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive font-semibold"
                          onClick={() => handleDelete(employee.id)}
                        >
                          Delete Employee
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {filteredEmployees.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <Building className="w-8 h-8 text-muted-foreground/50" />
                      No employees found in the organizational structure.
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      </ThreeDCard>
    </div>
  );
}
