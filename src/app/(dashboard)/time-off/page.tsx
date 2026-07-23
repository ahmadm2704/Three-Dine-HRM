"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, Clock, CheckCircle2, XCircle, Loader2, Check, X, Trash2, Plus } from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThreeDPageHeader } from "@/components/ui/ThreeDPageHeader";
import { ThreeDCard } from "@/components/ui/ThreeDCard";

export default function TimeOff() {
  const [requests, setRequests] = useState<any[]>([]);
  const [allEmployees, setAllEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState("employee");
  
  // Calendar Dialog
  const [showCalendar, setShowCalendar] = useState(false);
  const [editingHolidays, setEditingHolidays] = useState(false);
  const [holidays, setHolidays] = useState([
    { name: "New Year's Day", date: "Jan 1" },
    { name: "Martin Luther King Jr. Day", date: "Jan 19" },
    { name: "Memorial Day", date: "May 25" },
    { name: "Independence Day", date: "Jul 4" },
    { name: "Labor Day", date: "Sep 7" },
    { name: "Thanksgiving Day", date: "Nov 28" },
    { name: "Day after Thanksgiving", date: "Nov 29" },
    { name: "Christmas Eve", date: "Dec 24" },
    { name: "Christmas Day", date: "Dec 25" },
    { name: "New Year's Eve", date: "Dec 31" }
  ]);
  
  // Request Form State
  const [showDialog, setShowDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    type: "pto",
    startDate: "",
    endDate: "",
    reason: ""
  });
  
  // To keep it simple for the demo, we fetch Ali Danish's ID (or any active employee)
  const [employeeId, setEmployeeId] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
    const savedHolidays = localStorage.getItem("threedine_holidays");
    if (savedHolidays) {
      try {
        setHolidays(JSON.parse(savedHolidays));
      } catch(e) {}
    }
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    
    // Get user info from localStorage
    let role = "employee";
    let email = "ali.danish@threedine.com"; // fallback
    let localEmpId = employeeId;
    
    const saved = localStorage.getItem("threedine_user");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        role = parsed.role;
        email = parsed.email;
        setUserRole(role);
        if (parsed.id) {
          localEmpId = parsed.id;
          setEmployeeId(parsed.id);
        }
      } catch (e) {}
    }

    // Grab the logged in user ID if not in localStorage
    let empId = localEmpId;
    if (!empId) {
      const { data: emp } = await supabase
        .from('employees')
        .select('id')
        .eq('email', email)
        .single();
        
      if (emp) {
        empId = emp.id;
        setEmployeeId(emp.id);
      }
    }

    if (empId) {
      const query = supabase
        .from('time_off_requests')
        .select(`
          *,
          employees!time_off_requests_employee_id_fkey (
            first_name,
            last_name
          )
        `)
        .order('created_at', { ascending: false });
        
      if (role === 'employee') {
        query.eq('employee_id', empId);
      } else {
        // If admin, also fetch all employees for the Team Balances tab
        const { data: emps } = await supabase.from('employees').select('id, first_name, last_name, job_title');
        if (emps) setAllEmployees(emps);
      }
      
      const { data, error } = await query;
      if (error) {
        console.error("Fetch requests error:", error);
        alert("Failed to load requests: " + error.message);
      }
      if (data) setRequests(data);
    }
    setLoading(false);
  };
  
  const handleStatusChange = async (id: string, newStatus: string) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
    
    try {
      const { error } = await supabase
        .from('time_off_requests')
        .update({ status: newStatus })
        .eq('id', id);
        
      if (error) {
        alert("Failed to update request: " + error.message);
        fetchRequests();
      }
    } catch (err: any) {
      alert("System Error: " + err.message);
      fetchRequests();
    }
  };

  const handleDeleteRequest = async (id: string) => {
    if (confirm("Are you sure you want to delete this request?")) {
      const { error } = await supabase
        .from('time_off_requests')
        .delete()
        .eq('id', id);

      if (!error) {
        setRequests(prev => prev.filter(r => r.id !== id));
      } else {
        alert("Failed to delete request: " + error.message);
      }
    }
  };

  const handleSaveHolidays = () => {
    localStorage.setItem("threedine_holidays", JSON.stringify(holidays));
    setEditingHolidays(false);
  };

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId) {
      alert("Error: Employee ID not found. Please log out and log back in.");
      return;
    }
    setSubmitting(true);

    try {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

      const payload = {
        employee_id: employeeId,
        type: formData.type,
        start_date: formData.startDate,
        end_date: formData.endDate,
        days_count: diffDays,
        reason: formData.reason,
        status: 'pending'
      };

      const { error } = await supabase
        .from('time_off_requests')
        .insert(payload);

      setSubmitting(false);
      
      if (!error) {
        setShowDialog(false);
        setFormData({ type: "pto", startDate: "", endDate: "", reason: "" });
        fetchRequests();
      } else {
        alert("Database Error: " + error.message);
      }
    } catch (err: any) {
      setSubmitting(false);
      alert("System Error: " + err.message);
    }
  };

  const myRequests = requests.filter(r => r.employee_id === employeeId);
  const usedPTO = myRequests.filter(r => r.type === 'pto' && r.status === 'approved').reduce((acc, curr) => acc + curr.days_count, 0);
  const usedSick = myRequests.filter(r => r.type === 'sick' && r.status === 'approved').reduce((acc, curr) => acc + curr.days_count, 0);
  const upcomingRequests = requests.filter(r => r.status === 'pending' || r.status === 'approved');
  const pastRequests = requests.filter(r => r.status === 'denied' || r.status === 'cancelled');
  const handleUpdateStatus = handleStatusChange;

  return (
    <div className="space-y-6">
      <ThreeDPageHeader
        title="Time Off & Leaves"
        subtitle="Manage leave balances, request paid time off, and track holiday schedules."
        badge="Leave Management"
      >
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-[0_0_20px_rgba(37,99,235,0.4)] rounded-2xl text-xs uppercase tracking-wider border border-blue-400/40 h-11 px-5">
              <CalendarDays className="mr-2 h-4 w-4" /> Request Time Off
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Request Time Off</DialogTitle>
              <DialogDescription>
                Submit a new request for time off. It will be sent to your manager for approval.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleRequestSubmit}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Leave Type</Label>
                  <select 
                    required
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value})}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  >
                    <option value="pto">Paid Time Off (PTO)</option>
                    <option value="sick">Sick Leave</option>
                    <option value="personal">Personal Leave</option>
                    <option value="bereavement">Bereavement</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start">Start Date</Label>
                    <Input 
                      required 
                      type="date" 
                      id="start"
                      value={formData.startDate}
                      onChange={e => setFormData({...formData, startDate: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end">End Date</Label>
                    <Input 
                      required 
                      type="date" 
                      id="end"
                      min={formData.startDate}
                      value={formData.endDate}
                      onChange={e => setFormData({...formData, endDate: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reason">Reason (Optional)</Label>
                  <textarea 
                    id="reason" 
                    placeholder="Provide additional details..." 
                    value={formData.reason}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({...formData, reason: e.target.value})}
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
                <Button type="submit" disabled={submitting}>
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Submit Request
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </ThreeDPageHeader>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-primary/10 via-background to-background border-primary/20 shadow-sm relative overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Paid Time Off (PTO)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {Math.max(0, 20 - usedPTO)} <span className="text-lg font-normal text-muted-foreground">Days</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Available balance</p>
            <div className="mt-4 pt-4 border-t flex justify-between text-xs text-muted-foreground">
              <span>Accrued: 20 Days</span>
              <span>Used: {usedPTO} Days</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Sick Leave</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {Math.max(0, 7 - usedSick)} <span className="text-lg font-normal text-muted-foreground">Days</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Available balance</p>
            <div className="mt-4 pt-4 border-t flex justify-between text-xs text-muted-foreground">
              <span>Accrued: 7 Days</span>
              <span>Used: {usedSick} Days</span>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Company Holidays</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 mt-1">
              {holidays.slice(0, 2).map((holiday, i) => (
                <div key={i} className="flex justify-between items-center text-sm">
                  <span className="font-medium">{holiday.name}</span>
                  <span className="text-muted-foreground">{holiday.date}</span>
                </div>
              ))}
            </div>
            <Button variant="link" className="p-0 h-auto mt-4 text-xs w-full justify-start text-primary" onClick={() => setShowCalendar(true)}>View full calendar</Button>
            
            <Dialog open={showCalendar} onOpenChange={setShowCalendar}>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <DialogTitle>Company Holidays</DialogTitle>
                      <DialogDescription>Full list of observed company holidays.</DialogDescription>
                    </div>
                    {userRole !== 'employee' && (
                      <Button variant="outline" size="sm" onClick={() => setEditingHolidays(!editingHolidays)}>
                        {editingHolidays ? "Cancel Edit" : "Edit Holidays"}
                      </Button>
                    )}
                  </div>
                </DialogHeader>
                <div className="space-y-4 py-4 max-h-[400px] overflow-y-auto pr-2">
                  {holidays.map((holiday, i) => (
                    <div key={i} className="flex justify-between items-center text-sm border-b pb-2 last:border-0">
                      {editingHolidays ? (
                        <>
                          <Input className="h-8 w-[45%]" value={holiday.name} onChange={e => {
                            const newH = [...holidays];
                            newH[i].name = e.target.value;
                            setHolidays(newH);
                          }} />
                          <Input className="h-8 w-[35%]" value={holiday.date} onChange={e => {
                            const newH = [...holidays];
                            newH[i].date = e.target.value;
                            setHolidays(newH);
                          }} />
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => {
                            const newH = holidays.filter((_, idx) => idx !== i);
                            setHolidays(newH);
                          }}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <span className="font-medium">{holiday.name}</span>
                          <span className="text-muted-foreground">{holiday.date}</span>
                        </>
                      )}
                    </div>
                  ))}
                  {editingHolidays && (
                    <Button variant="outline" className="w-full text-xs border-dashed" onClick={() => {
                      setHolidays([...holidays, { name: "New Holiday", date: "Jan 1" }]);
                    }}>
                      <Plus className="h-4 w-4 mr-2" /> Add Holiday
                    </Button>
                  )}
                </div>
                <DialogFooter>
                  {editingHolidays ? (
                    <Button onClick={() => {
                      localStorage.setItem("threedine_holidays", JSON.stringify(holidays));
                      setEditingHolidays(false);
                    }}>Save Changes</Button>
                  ) : (
                    <Button onClick={() => setShowCalendar(false)}>Close</Button>
                  )}
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm border-border/50">
        <CardHeader>
          <CardTitle>History & Requests</CardTitle>
          <CardDescription>View your past and pending time off requests.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="upcoming" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="upcoming">Upcoming & Pending</TabsTrigger>
              <TabsTrigger value="past">Past Requests</TabsTrigger>
              {userRole !== 'employee' && (
                <TabsTrigger value="team">Team Balances</TabsTrigger>
              )}
            </TabsList>
            
            <TabsContent value="upcoming">
              <div className="space-y-4">
                {loading ? (
                  <div className="py-8 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
                ) : upcomingRequests.length > 0 ? (
                  upcomingRequests.map((req, i) => (
                    <div key={i} className="flex items-center justify-between p-4 border border-border/50 rounded-xl bg-card hover:shadow-sm hover:bg-muted/30 transition-all">
                      <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${req.status === 'approved' ? 'bg-success/10' : 'bg-warning/10'}`}>
                          {req.status === 'approved' ? (
                            <CheckCircle2 className="w-5 h-5 text-success" />
                          ) : (
                            <Clock className="w-5 h-5 text-warning" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold uppercase text-sm tracking-wider">{req.type}</span>
                            {userRole !== 'employee' && req.employees && (
                              <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                                {req.employees.first_name} {req.employees.last_name}
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">{new Date(req.start_date).toLocaleDateString()} - {new Date(req.end_date).toLocaleDateString()}</div>
                          {req.reason && <div className="text-xs text-muted-foreground mt-1 line-clamp-1">"{req.reason}"</div>}
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end gap-2">
                        <div>
                          <div className="font-medium">{req.days_count} {req.days_count === 1 ? 'Day' : 'Days'}</div>
                          <div className={`text-xs font-bold uppercase tracking-wider mt-0.5 ${req.status === 'approved' ? 'text-success' : 'text-warning'}`}>{req.status}</div>
                        </div>
                        {userRole !== 'employee' && req.status === 'pending' && (
                          <div className="flex gap-1 mt-1">
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-success hover:text-success hover:bg-success/10" onClick={() => handleUpdateStatus(req.id, 'approved')}>
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleUpdateStatus(req.id, 'denied')}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground border rounded-xl bg-muted/20">
                    No upcoming or pending requests found.
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="past">
              <div className="space-y-4">
                {loading ? (
                  <div className="py-8 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
                ) : pastRequests.length > 0 ? (
                  pastRequests.map((req, i) => (
                    <div key={i} className="flex items-center justify-between p-4 border border-border/50 rounded-xl bg-card hover:shadow-sm hover:bg-muted/30 transition-all opacity-75">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
                          <XCircle className="w-5 h-5 text-destructive" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold uppercase text-sm tracking-wider">{req.type}</span>
                            {userRole !== 'employee' && req.employees && (
                              <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                                {req.employees.first_name} {req.employees.last_name}
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">{new Date(req.start_date).toLocaleDateString()} - {new Date(req.end_date).toLocaleDateString()}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{req.days_count} {req.days_count === 1 ? 'Day' : 'Days'}</div>
                        <div className="text-xs font-bold uppercase tracking-wider mt-0.5 text-destructive">{req.status}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground border rounded-xl bg-muted/20">
                    No past requests found.
                  </div>
                )}
              </div>
            </TabsContent>

            {userRole !== 'employee' && (
              <TabsContent value="team">
                <div className="space-y-4">
                  {allEmployees.map(emp => {
                    const empReqs = requests.filter(r => r.employee_id === emp.id);
                    const empUsedPTO = empReqs.filter(r => r.type === 'pto' && r.status === 'approved').reduce((acc, curr) => acc + curr.days_count, 0);
                    const empUsedSick = empReqs.filter(r => r.type === 'sick' && r.status === 'approved').reduce((acc, curr) => acc + curr.days_count, 0);
                    
                    return (
                      <div key={emp.id} className="flex items-center justify-between p-4 border border-border/50 rounded-xl bg-card hover:shadow-sm hover:bg-muted/30 transition-all">
                        <div>
                          <div className="font-semibold">{emp.first_name} {emp.last_name}</div>
                          <div className="text-sm text-muted-foreground">{emp.job_title || 'Employee'}</div>
                        </div>
                        <div className="flex gap-6 text-right">
                          <div className="bg-primary/5 px-3 py-2 rounded-lg border border-primary/10">
                            <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-1">Paid Time Off</div>
                            <div className="font-bold text-primary">{Math.max(0, 20 - empUsedPTO)} Days</div>
                            <div className="text-xs text-muted-foreground mt-0.5">{empUsedPTO}/20 Used</div>
                          </div>
                          <div className="bg-muted/50 px-3 py-2 rounded-lg border border-border/50">
                            <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-1">Sick Leave</div>
                            <div className="font-bold">{Math.max(0, 7 - empUsedSick)} Days</div>
                            <div className="text-xs text-muted-foreground mt-0.5">{empUsedSick}/7 Used</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {allEmployees.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground border rounded-xl bg-muted/20">
                      No employees found.
                    </div>
                  )}
                </div>
              </TabsContent>
            )}
            
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
