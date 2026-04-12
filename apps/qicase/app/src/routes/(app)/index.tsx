import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CasePhase, Deadline, Issue, Task } from "@repo/db/schema";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Badge, Button } from "@repo/ui";
import { AlertTriangle, Clock, Activity, Loader2, Plus } from "lucide-react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { cn } from "@repo/ui/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@repo/ui";
import { EntityForm } from "@/components/EntityForm";

import { api } from "@/lib/trpc";

export const Route = createFileRoute("/(app)/")({
  component: Dashboard,
});

function Dashboard() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const { data: phases = [], isLoading: loadingPhases } = useQuery(api.case.getPhases.queryOptions());
  const { data: deadlines = [], isLoading: loadingDeadlines } = useQuery(api.case.getDeadlines.queryOptions()); 
  const { data: issues = [], isLoading: loadingIssues } = useQuery(api.case.getIssues.queryOptions());
  const { data: tasks = [], isLoading: loadingTasks } = useQuery(api.case.getTasks.queryOptions()); 


  if (loadingPhases || loadingDeadlines || loadingIssues || loadingTasks) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const activePhases = phases.filter(p => p.status === 'ACTIVE');
  const criticalDeadlines = deadlines.filter(d => d.status === 'Pending' || d.status === 'Missed');
  
  return (
    <div className="space-y-6 animate-in fade-in duration-500 p-6">
      
      {/* Top Stats Row */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-serif font-bold text-primary">Case Overview</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex gap-2">
              <Plus className="w-4 h-4" /> Quick Add Task
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Quick Add Task</DialogTitle>
            </DialogHeader>
            <EntityForm type="tasks" onSuccess={() => setIsDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-primary shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Active Phases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{activePhases.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Current Focus: {activePhases[0]?.phaseId || "None"}</p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-destructive shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Critical Deadlines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-destructive">{criticalDeadlines.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Require immediate attention</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Proven Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{issues.filter(i => i.status === 'Proved').length}</div>
            <p className="text-xs text-muted-foreground mt-1">Facts established</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Pending Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{tasks.filter(t => t.status !== 'Done').length}</div>
            <p className="text-xs text-muted-foreground mt-1">Execution required</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-serif font-bold text-primary flex items-center gap-2">
              <Activity className="w-5 h-5 text-accent" />
              Active Phases
            </h2>
            <Link to="/phases" className="text-sm text-primary hover:underline font-medium">View All Phases &rarr;</Link>
          </div>

          <div className="space-y-4">
            {activePhases.map(phase => (
              <Card key={phase.phaseId} className="overflow-hidden border-border hover:border-primary/20 transition-colors">
                <div className="h-1 w-full bg-primary"></div>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="font-mono text-xs bg-primary/10 text-primary border-primary/20">
                          {phase.phaseId}
                        </Badge>
                        <Badge variant="secondary" className="text-xs uppercase font-bold tracking-wider">
                          {phase.status}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg font-serif">{phase.phaseName}</CardTitle>
                      <CardDescription className="mt-1 font-medium text-foreground/70">{phase.purpose}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {phase.notes && (
                    <div className="bg-muted/50 p-3 rounded-md text-sm italic border border-border/50">
                      &quot;{phase.notes}&quot;
                    </div>
                  )}
                  {phase.phaseId === 'C-03' && (
                    <div className="mt-4 grid grid-cols-3 gap-2">
                      <div className="p-2 bg-slate-100 dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800 text-center">
                        <div className="text-xs uppercase font-bold text-slate-500">Furnisher</div>
                        <div className="font-mono text-sm font-bold">FCFCU</div>
                      </div>
                      <div className="p-2 bg-slate-100 dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800 text-center">
                        <div className="text-xs uppercase font-bold text-slate-500">TransUnion</div>
                        <div className="font-mono text-sm font-bold">Active</div>
                      </div>
                      <div className="p-2 bg-slate-100 dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-800 text-center">
                        <div className="text-xs uppercase font-bold text-slate-500">Equifax</div>
                        <div className="font-mono text-sm font-bold text-slate-400">--</div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          <h2 className="text-xl font-serif font-bold text-primary flex items-center gap-2">
            <Clock className="w-5 h-5 text-destructive" />
            Statutory Clocks
          </h2>
          
          <div className="space-y-3">
            {criticalDeadlines.map(deadline => (
              <Card key={deadline.deadlineId} className={cn(
                "border-l-4",
                deadline.status === 'Missed' ? "border-l-destructive bg-destructive/5" : "border-l-amber-500"
              )}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline" className="font-mono text-[10px] uppercase">
                      {deadline.deadlineId}
                    </Badge>
                    <span className={cn(
                      "text-xs font-bold uppercase",
                      deadline.status === 'Missed' ? "text-destructive" : "text-amber-600"
                    )}>
                      {deadline.status}
                    </span>
                  </div>
                  <div className="text-sm font-medium leading-tight mb-2">
                    {deadline.trigger}
                  </div>
                  <div className="text-xs text-muted-foreground flex justify-between items-center">
                    <span>Due: <span className="font-mono text-foreground font-semibold">
                      {new Date(deadline.dueDate).toLocaleDateString()}
                    </span></span>
                  </div>
                  {deadline.status === 'Missed' && (
                     <div className="mt-2 text-[10px] font-bold text-destructive flex items-center gap-1">
                       <AlertTriangle className="w-3 h-3" />
                       {deadline.consequence}
                     </div>
                  )}
                </CardContent>
              </Card>
            ))}
            
            {criticalDeadlines.length === 0 && (
              <div className="p-4 border border-dashed rounded-md text-center text-sm text-muted-foreground">
                No active clocks ticking.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
