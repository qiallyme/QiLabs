import { useQuery } from "@tanstack/react-query";
import { CasePhase } from "@repo/db/schema";
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@repo/ui";
import { cn } from "@repo/ui/lib/utils";
import { CheckCircle2, Lock, Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { EntityForm } from "@/components/EntityForm";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(app)/phases")({
  component: Phases,
});

function Phases() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: phases = [], isLoading } = useQuery<CasePhase[]>({ 
    queryKey: ["/api/phases"],
    queryFn: () => fetch("/api/phases").then(res => res.json())
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 p-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl font-serif font-bold text-primary">Case Phases</h2>
          <p className="text-muted-foreground">Canonical order of litigation.</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="w-4 h-4"/> Add Phase</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add New Phase</DialogTitle></DialogHeader>
            <EntityForm type="phases" onSuccess={() => setIsOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative border-l-2 border-border ml-4 md:ml-8 space-y-12 py-4">
        {phases.map((phase) => {
          const isActive = phase.status === 'ACTIVE';
          const isClosed = phase.status === 'CLOSED';
          const isPending = phase.status === 'PENDING';

          return (
            <div key={phase.phaseId} className="relative pl-8 md:pl-12">
              {/* Timeline Node */}
              <div className={cn(
                "absolute -left-[9px] top-6 w-5 h-5 rounded-full border-4 transition-colors z-10",
                isActive ? "bg-background border-primary scale-125" : 
                isClosed ? "bg-primary border-primary" :
                "bg-background border-border"
              )}>
                {isClosed && <CheckCircle2 className="w-3 h-3 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />}
              </div>

              <Card className={cn(
                "transition-all duration-300",
                isActive ? "border-primary shadow-md ring-1 ring-primary/20" : "opacity-80 hover:opacity-100"
              )}>
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-bold text-muted-foreground">{phase.phaseId}</span>
                      <Badge className={cn(
                        "font-bold uppercase tracking-wider text-[10px]",
                        isActive ? "bg-primary hover:bg-primary" :
                        isClosed ? "bg-muted-foreground hover:bg-muted-foreground" :
                        "bg-muted text-muted-foreground hover:bg-muted"
                      )}>
                        {phase.status}
                      </Badge>
                    </div>
                    {isPending && <Lock className="w-4 h-4 text-muted-foreground/30" />}
                  </div>
                  <CardTitle className="text-xl font-serif">{phase.phaseName}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">Purpose</h4>
                      <p className="text-sm leading-relaxed">{phase.purpose}</p>
                    </div>
                    
                    {phase.notes && (
                      <div className="bg-muted p-3 rounded text-sm text-muted-foreground border border-border/50 flex gap-3 items-start">
                        <span className="text-accent font-bold">NOTE:</span>
                        {phase.notes}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}
