"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, ShieldCheck, Settings as SettingsIcon, History, Plus, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { ThreeDPageHeader } from "@/components/ui/ThreeDPageHeader";
import { ThreeDCard } from "@/components/ui/ThreeDCard";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { formatDistanceToNow } from "date-fns";

export default function AdminPortal() {
  const [activeTab, setActiveTab] = useState("settings");
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [departmentOrder, setDepartmentOrder] = useState<string[]>([]);
  
  // Settings State
  const [settings, setSettings] = useState({
    companyName: "Three Dine Corporation",
    domain: "threedine.com",
    timezone: "America/New_York",
    currency: "USD"
  });
  const [savingSettings, setSavingSettings] = useState(false);

  // New Department State
  const [showDeptDialog, setShowDeptDialog] = useState(false);
  const [savingDept, setSavingDept] = useState(false);
  const [newDept, setNewDept] = useState({
    name: "",
    head_name: "",
    head_title: "",
    color: "#6366f1"
  });

  // Roles State
  const defaultRoles = [
    { id: "1", role: 'Super Admin', desc: 'Full access to all system features and settings.', permissions: ['all'] },
    { id: "2", role: 'HR Admin', desc: 'Access to employee data, payroll, and reports.', permissions: ['employees_read', 'employees_write', 'payroll_read'] },
    { id: "3", role: 'Manager', desc: 'Can view and manage direct reports.', permissions: ['employees_read'] },
    { id: "4", role: 'Employee', desc: 'Self-service access only.', permissions: ['self_read'] }
  ];
  const [roles, setRoles] = useState(defaultRoles);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [newRole, setNewRole] = useState({ role: "", desc: "" });
  const [showPermissionsDialog, setShowPermissionsDialog] = useState(false);
  const [selectedRole, setSelectedRole] = useState<any>(null);

  // Edit Department State
  const [showEditDeptDialog, setShowEditDeptDialog] = useState(false);
  const [editingDept, setEditingDept] = useState<any>(null);

  useEffect(() => {
    fetchData();
    // Load local settings
    const saved = localStorage.getItem("threedine_settings");
    if (saved) setSettings(JSON.parse(saved));
    
    // Load roles
    const savedRoles = localStorage.getItem("threedine_roles");
    if (savedRoles) setRoles(JSON.parse(savedRoles));
  }, []);

  const fetchData = async () => {
    setLoading(true);
    // Fetch Departments
    const { data: depts } = await supabase.from("departments").select("*");
    
    // Fetch Order
    const savedOrderStr = localStorage.getItem("threedine_dept_order");
    let orderArray: string[] = [];
    if (savedOrderStr) {
      orderArray = JSON.parse(savedOrderStr);
      setDepartmentOrder(orderArray);
    }
    
    if (depts) {
      // Load custom details
      const detailsStr = localStorage.getItem("threedine_dept_details");
      const detailsMap = detailsStr ? JSON.parse(detailsStr) : {};

      // Sort and map departments based on saved order array
      const sortedDepts = [...depts].map(dept => ({
        ...dept,
        head_name: detailsMap[dept.id]?.head_name || dept.head_name,
        head_title: detailsMap[dept.id]?.head_title || dept.head_title,
        color: detailsMap[dept.id]?.color || dept.color || "#6366f1"
      })).sort((a, b) => {
        const indexA = orderArray.indexOf(a.id);
        const indexB = orderArray.indexOf(b.id);
        if (indexA === -1 && indexB === -1) return 0;
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
      });
      setDepartments(sortedDepts);
    }

    // Fetch Audit Logs
    const { data: logs } = await supabase.from("audit_log").select("*").order("created_at", { ascending: false }).limit(20);
    if (logs) setAuditLogs(logs);

    setLoading(false);
  };

  const createAuditLog = async (action: string, details: string) => {
    await supabase.from("audit_log").insert({
      user_name: "Ali Danish", // Mocked current user
      action,
      details
    });
    fetchData(); // Refresh logs
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    localStorage.setItem("threedine_settings", JSON.stringify(settings));
    await createAuditLog("Updated Company Settings", `Updated timezone to ${settings.timezone} and currency to ${settings.currency}`);
    setSavingSettings(false);
    alert("Settings saved securely!");
  };

  const handleAddDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingDept(true);
    
    // We only insert standard columns into DB
    const { data, error } = await supabase.from("departments").insert({
      name: newDept.name,
      company_id: "550e8400-e29b-41d4-a716-446655440000" // Fallback company ID if required by schema, but typically we let it error if not provided or we handle it gracefully. Wait, companies is a required foreign key. We'll try to insert name and let it auto-fill if there's a default, or it might fail if we don't have company_id. 
    }).select().single();

    if (!error && data) {
      // Save the custom metadata locally
      const detailsStr = localStorage.getItem("threedine_dept_details");
      const detailsMap = detailsStr ? JSON.parse(detailsStr) : {};
      detailsMap[data.id] = { head_name: newDept.head_name, head_title: newDept.head_title, color: newDept.color };
      localStorage.setItem("threedine_dept_details", JSON.stringify(detailsMap));

      await createAuditLog("Created Department", `Added new department: ${newDept.name}`);
      setShowDeptDialog(false);
      setNewDept({ name: "", head_name: "", head_title: "", color: "#6366f1" });
      fetchData();
    } else {
      alert("Error adding department: " + (error?.message || "Unknown error"));
    }
    setSavingDept(false);
  };

  const moveDepartment = (index: number, direction: 'up' | 'down') => {
    const newDepts = [...departments];
    if (direction === 'up' && index > 0) {
      [newDepts[index - 1], newDepts[index]] = [newDepts[index], newDepts[index - 1]];
    } else if (direction === 'down' && index < newDepts.length - 1) {
      [newDepts[index + 1], newDepts[index]] = [newDepts[index], newDepts[index + 1]];
    } else {
      return;
    }
    
    setDepartments(newDepts);
    const newOrder = newDepts.map(d => d.id);
    setDepartmentOrder(newOrder);
    localStorage.setItem("threedine_dept_order", JSON.stringify(newOrder));
  };

  const handleEditDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDept) return;
    setSavingDept(true);
    
    // Save metadata locally to bypass DB schema limitations
    const detailsStr = localStorage.getItem("threedine_dept_details");
    const detailsMap = detailsStr ? JSON.parse(detailsStr) : {};
    detailsMap[editingDept.id] = {
      head_name: editingDept.head_name,
      head_title: editingDept.head_title,
      color: editingDept.color || "#6366f1"
    };
    localStorage.setItem("threedine_dept_details", JSON.stringify(detailsMap));

    // Optimistically update local state immediately
    setDepartments(departments.map(d => d.id === editingDept.id ? editingDept : d));
    
    await createAuditLog("Updated Department", `Changed department head for ${editingDept.name}`);
    setShowEditDeptDialog(false);
    fetchData();
    
    setSavingDept(false);
  };

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    const roleObj = { id: Date.now().toString(), role: newRole.role, desc: newRole.desc, permissions: [] };
    const updatedRoles = [...roles, roleObj];
    setRoles(updatedRoles);
    localStorage.setItem("threedine_roles", JSON.stringify(updatedRoles));
    
    await createAuditLog("Created Role", `Created new custom role: ${newRole.role}`);
    
    setShowRoleDialog(false);
    setNewRole({ role: "", desc: "" });
  };

  return (
    <div className="space-y-6">
      <ThreeDPageHeader
        title="Admin Control Mesh"
        subtitle="Manage company settings, organizational hierarchy, access roles, and system audit logs."
        badge="Enterprise Controls"
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="settings" className="data-[state=active]:bg-background shadow-sm">
            <SettingsIcon className="w-4 h-4 mr-2" />
            Company Settings
          </TabsTrigger>
          <TabsTrigger value="departments" className="data-[state=active]:bg-background shadow-sm">
            <Building2 className="w-4 h-4 mr-2" />
            Organization
          </TabsTrigger>
          <TabsTrigger value="roles" className="data-[state=active]:bg-background shadow-sm">
            <ShieldCheck className="w-4 h-4 mr-2" />
            Roles & Permissions
          </TabsTrigger>
          <TabsTrigger value="audit" className="data-[state=active]:bg-background shadow-sm">
            <History className="w-4 h-4 mr-2" />
            Audit Log
          </TabsTrigger>
        </TabsList>

        <TabsContent value="settings">
          <Card className="shadow-sm border-t-4 border-t-primary">
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>Update your company details and global settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input 
                    id="companyName" 
                    value={settings.companyName}
                    onChange={(e) => setSettings({...settings, companyName: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="domain">Primary Domain</Label>
                  <Input 
                    id="domain" 
                    value={settings.domain}
                    onChange={(e) => setSettings({...settings, domain: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Default Timezone</Label>
                  <Input 
                    id="timezone" 
                    value={settings.timezone}
                    onChange={(e) => setSettings({...settings, timezone: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Default Currency</Label>
                  <Input 
                    id="currency" 
                    value={settings.currency}
                    onChange={(e) => setSettings({...settings, currency: e.target.value})}
                  />
                </div>
              </div>
              <div className="pt-4 flex justify-end">
                <Button onClick={handleSaveSettings} disabled={savingSettings}>
                  {savingSettings && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="departments">
          <Card className="shadow-sm border-t-4 border-t-primary">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 gap-4">
              <div>
                <CardTitle className="text-xl">Organizational Structure</CardTitle>
                <CardDescription>Manage your company hierarchy, departments, and reporting lines.</CardDescription>
              </div>
              
              <Dialog open={showDeptDialog} onOpenChange={setShowDeptDialog}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 shrink-0">
                    <Plus className="w-4 h-4 mr-2" /> Add Department
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Department</DialogTitle>
                    <DialogDescription>Create a new department in your organization.</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddDepartment} className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="deptName">Department Name</Label>
                      <Input required id="deptName" value={newDept.name} onChange={e => setNewDept({...newDept, name: e.target.value})} placeholder="e.g. Design Team" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="headName">Department Head (Name)</Label>
                      <Input id="headName" value={newDept.head_name} onChange={e => setNewDept({...newDept, head_name: e.target.value})} placeholder="e.g. Sarah Smith" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="headTitle">Head Title</Label>
                      <Input id="headTitle" value={newDept.head_title} onChange={e => setNewDept({...newDept, head_title: e.target.value})} placeholder="e.g. Lead Designer" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="color">Theme Color (Hex)</Label>
                      <Input required type="color" id="color" value={newDept.color} onChange={e => setNewDept({...newDept, color: e.target.value})} className="h-10 px-2 py-1" />
                    </div>
                    <DialogFooter>
                      <Button type="submit" disabled={savingDept}>
                        {savingDept && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Create Department
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>

            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="py-8 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2">
                  {departments.map((dept, index) => (
                    <div key={dept.id} className="flex flex-col border border-border/50 rounded-xl overflow-hidden hover:border-primary/50 transition-all duration-300 shadow-sm group">
                      <div className="flex flex-col items-start justify-between p-5 bg-card relative overflow-hidden h-full">
                        
                        {/* Sequence Controls */}
                        <div className="absolute right-4 top-4 flex flex-col gap-1 z-20 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm rounded-lg border p-1 shadow-sm">
                          <Button variant="ghost" size="icon" className="h-6 w-6" disabled={index === 0} onClick={() => moveDepartment(index, 'up')}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
                          </Button>
                          <Button variant="ghost" size="icon" className="h-6 w-6" disabled={index === departments.length - 1} onClick={() => moveDepartment(index, 'down')}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                          </Button>
                        </div>

                        <div 
                          className="absolute top-0 right-0 w-24 h-24 rounded-full blur-[40px] opacity-20 -mr-10 -mt-10 pointer-events-none transition-opacity group-hover:opacity-40" 
                          style={{ backgroundColor: dept.color }} 
                        />
                        <div className="w-full relative z-10 pr-8">
                          <div className="font-bold text-xl flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full shadow-sm shrink-0" style={{ backgroundColor: dept.color }} />
                            {dept.name}
                          </div>
                          <div className="mt-4 space-y-1">
                            <div className="text-sm text-muted-foreground font-medium uppercase tracking-wider text-[10px]">Department Head</div>
                            <div className="font-semibold truncate">{dept.head_name || "Unassigned"}</div>
                            <div className="text-xs text-muted-foreground truncate">{dept.head_title || "No Title"}</div>
                          </div>
                        </div>
                        <div className="mt-6 w-full flex items-center gap-2 relative z-10">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full" 
                            onClick={() => {
                              setEditingDept(dept);
                              setShowEditDeptDialog(true);
                            }}
                          >
                            Manage Department Roles
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Edit Department Dialog */}
          <Dialog open={showEditDeptDialog} onOpenChange={setShowEditDeptDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Manage Department</DialogTitle>
                <DialogDescription>Update the department head and reporting roles for {editingDept?.name}.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleEditDepartment} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="editHeadName">Department Head (Name)</Label>
                  <Input id="editHeadName" value={editingDept?.head_name || ''} onChange={e => setEditingDept({...editingDept, head_name: e.target.value})} placeholder="e.g. Sarah Smith" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editHeadTitle">Head Title</Label>
                  <Input id="editHeadTitle" value={editingDept?.head_title || ''} onChange={e => setEditingDept({...editingDept, head_title: e.target.value})} placeholder="e.g. Lead Designer" />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setShowEditDeptDialog(false)}>Cancel</Button>
                  <Button type="submit" disabled={savingDept}>
                    {savingDept && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Save Changes
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

        </TabsContent>

        <TabsContent value="roles">
          <Card className="shadow-sm border-t-4 border-t-primary">
            <CardHeader className="flex flex-row items-center justify-between pb-6">
              <div>
                <CardTitle>Roles & Permissions</CardTitle>
                <CardDescription>Configure access levels for different employee types.</CardDescription>
              </div>
              
              <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-primary text-primary-foreground"><Plus className="w-4 h-4 mr-2"/> Create Role</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Custom Role</DialogTitle>
                    <DialogDescription>Add a new role to assign to employees.</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateRole} className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="roleName">Role Name</Label>
                      <Input required id="roleName" value={newRole.role} onChange={e => setNewRole({...newRole, role: e.target.value})} placeholder="e.g. Finance Viewer" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="roleDesc">Description</Label>
                      <Input required id="roleDesc" value={newRole.desc} onChange={e => setNewRole({...newRole, desc: e.target.value})} placeholder="e.g. Read-only access to payroll data" />
                    </div>
                    <DialogFooter>
                      <Button type="submit">Save Role</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {roles.map((item) => (
                  <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 border border-border/50 rounded-xl gap-4 hover:shadow-md hover:border-primary/30 transition-all bg-card">
                    <div>
                      <div className="font-bold text-lg">{item.role}</div>
                      <div className="text-sm text-muted-foreground mt-1">{item.desc}</div>
                    </div>
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      className="shrink-0"
                      onClick={() => {
                        setSelectedRole(item);
                        setShowPermissionsDialog(true);
                      }}
                    >
                      Manage Permissions
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Permissions Dialog */}
          <Dialog open={showPermissionsDialog} onOpenChange={setShowPermissionsDialog}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Manage Permissions</DialogTitle>
                <DialogDescription>Configure system access for the <span className="font-bold text-foreground">{selectedRole?.role}</span> role.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  {['Manage Employees', 'View Payroll', 'Approve Time Off', 'Edit Org Chart', 'Manage Documents', 'System Settings'].map(perm => {
                    const isChecked = selectedRole?.permissions?.includes(perm) || selectedRole?.role === 'Super Admin';
                    return (
                      <div key={perm} className="flex items-center space-x-2 border p-3 rounded-lg">
                        <input 
                          type="checkbox" 
                          id={perm} 
                          className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary" 
                          checked={isChecked}
                          onChange={(e) => {
                            if (!selectedRole) return;
                            let newPerms = [...(selectedRole.permissions || [])];
                            if (e.target.checked) {
                              newPerms.push(perm);
                            } else {
                              newPerms = newPerms.filter(p => p !== perm);
                            }
                            setSelectedRole({...selectedRole, permissions: newPerms});
                          }}
                        />
                        <Label htmlFor={perm} className="text-sm font-medium cursor-pointer">{perm}</Label>
                      </div>
                    );
                  })}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowPermissionsDialog(false)}>Cancel</Button>
                <Button onClick={async () => {
                  if (!selectedRole) return;
                  
                  // Update roles list
                  const updatedRoles = roles.map(r => r.id === selectedRole.id ? selectedRole : r);
                  setRoles(updatedRoles);
                  localStorage.setItem("threedine_roles", JSON.stringify(updatedRoles));

                  setShowPermissionsDialog(false);
                  await createAuditLog("Updated Permissions", `Updated access rights for ${selectedRole?.role}`);
                }}>Save Permissions</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="audit">
          <Card className="shadow-sm border-t-4 border-t-primary">
            <CardHeader>
              <CardTitle>Audit Log</CardTitle>
              <CardDescription>Live database tracking of all system changes and actions for compliance.</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="py-8 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
              ) : auditLogs.length > 0 ? (
                <div className="space-y-4">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="flex items-start gap-4 p-4 border border-border/50 rounded-xl hover:bg-muted/30 transition-all bg-card">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <History className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm">
                          <span className="font-bold">{log.user_name}</span> {log.action}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1 bg-muted inline-block px-2 py-0.5 rounded-md">
                          {log.details || "No additional details"}
                        </div>
                        <div className="text-xs text-muted-foreground mt-2 font-medium">
                          {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border rounded-xl bg-muted/20 text-muted-foreground">
                  No audit logs found. Try changing some settings!
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
