import { Card, CardContent, CardHeader, CardTitle, CardDescription, Label, Input, Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui";
import { Shield, Database, Bell, Loader2, Upload, User as UserIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Case, User } from "@repo/db/schema";
import { EntityForm } from "@/components/EntityForm";
import { useState, useRef } from "react";
import { queryClient } from "@/lib/query";
import { parseCSV } from "@/lib/utils";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(app)/settings")({
  component: Settings,
});

function Settings() {
  const { data: caseData, isLoading } = useQuery<Case>({ 
    queryKey: ["/api/case"],
    queryFn: () => fetch("/api/case").then(res => res.json())
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 p-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-serif font-bold text-primary">Case Configuration</h2>
        <p className="text-muted-foreground">Adjust system parameters and case-specific metadata.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg font-serif">Case Metadata</CardTitle>
            </div>
            <CardDescription>Primary identifiers for the litigation matter.</CardDescription>
          </CardHeader>
          <CardContent>
            {caseData ? (
             <EntityForm type="case" initialData={caseData} />
            ) : (
               <div className="text-sm text-muted-foreground">No case data found.</div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Database className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg font-serif">Data Management</CardTitle>
            </div>
            <CardDescription>Configure storage and persistence layers.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-3 border rounded-md bg-emerald-50 border-emerald-100">
              <div className="space-y-1">
                <p className="text-sm font-bold text-emerald-900">System Status</p>
                <p className="text-xs text-emerald-700">Storage Layer Active</p>
              </div>
              <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-medium">Persistence Tier</p>
              <p className="text-xs text-muted-foreground">Data is persisted via defined storage provider.</p>
            </div>
            
            <div className="pt-4 border-t space-y-3">
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4 text-primary" />
                <p className="text-sm font-bold">Import Data (CSV)</p>
              </div>
              <ImportSection />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border md:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <UserIcon className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg font-serif">User Accounts</CardTitle>
            </div>
            <CardDescription>Manage user profiles and access roles.</CardDescription>
          </CardHeader>
          <CardContent>
             <UserSection />
          </CardContent>
        </Card>

        <Card className="border-border md:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Bell className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg font-serif">Statutory Notification Matrix</CardTitle>
            </div>
            <CardDescription>Define how legal clocks trigger alerts.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              Configuration for statutory alerts is defined by the <span className="font-mono text-primary font-bold">DEADLINES</span> table. 
              Clocks are currently calculated in real-time based on triggers.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ImportSection() {
  const [type, setType] = useState<string>("issues");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const text = await file.text();
      const records = parseCSV(text);
      
      let successCount = 0;
      let failCount = 0;

      for (const record of records) {
        try {
          Object.keys(record).forEach(k => !record[k] && delete record[k]);
          
          const res = await fetch(`/api/${type}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(record)
          });
          if (res.ok) successCount++;
          else failCount++;
        } catch (err) {
          console.error(err);
          failCount++;
        }
      }

      console.log(`Import Complete: Successfully imported ${successCount} records. ${failCount > 0 ? `${failCount} failed.` : ''}`);
      queryClient.invalidateQueries({ queryKey: [`/api/${type}`] });
      
    } catch (err) {
      console.error("Import Failed: Failed to parse or upload file.");
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex gap-2 items-center">
      <Select value={type} onValueChange={setType}>
        <SelectTrigger className="w-[120px] h-8 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="issues">Issues</SelectItem>
          <SelectItem value="events">Events</SelectItem>
          <SelectItem value="documents">Docs</SelectItem>
          <SelectItem value="letters">Letters</SelectItem>
          <SelectItem value="phases">Phases</SelectItem>
          <SelectItem value="deadlines">Deadlines</SelectItem>
          <SelectItem value="tasks">Tasks</SelectItem>
        </SelectContent>
      </Select>
      <div className="relative">
        <Button variant="outline" size="sm" className="h-8 text-xs cursor-pointer" disabled={loading} onClick={() => fileInputRef.current?.click()}>
          {loading ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Upload className="w-3 h-3 mr-1" />}
          Select CSV
        </Button>
        <input 
          type="file" 
          ref={fileInputRef}
          className="hidden" 
          accept=".csv"
          title="Import CSV File"
          onChange={handleImport} 
        />
      </div>
    </div>
  );
}

function UserSection() {
  const { data: users = [] } = useQuery<User[]>({ 
    queryKey: ["/api/users"],
    queryFn: () => fetch("/api/users").then(res => res.json())
  });
  
  if (users.length === 0) return <div className="text-muted-foreground text-sm">No users found.</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {users.map(user => (
        <div key={user.id} className="flex items-center justify-between p-3 border rounded-md bg-white dark:bg-slate-950">
           <div>
              <p className="font-bold text-sm">{user.name || user.email}</p>
              <p className="text-xs text-muted-foreground capitalize">User</p>
           </div>
           <div className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">
             {user.email}
           </div>
        </div>
      ))}
    </div>
  );
}
