import { useState, useMemo, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  CaseEvent, Document, Letter, Deadline, Task 
} from "@repo/db/schema";
import { 
  Card, CardContent, CardHeader, CardTitle, Badge, Button, Slider, Tabs, TabsList, TabsTrigger, Dialog, DialogContent, DialogHeader, DialogTitle
} from "@repo/ui";
import { 
  ZoomIn, 
  ZoomOut, 
  Calendar as CalendarIcon,
  Clock,
  FileText,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  GitBranch
} from "lucide-react";
import { format, addDays, subDays, startOfDay, endOfDay, isWithinInterval, differenceInDays, eachDayOfInterval, startOfWeek, endOfWeek, eachWeekOfInterval, startOfMonth, endOfMonth, eachMonthOfInterval } from "date-fns";
import { cn } from "@repo/ui/lib/utils";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(app)/timeline")({
  component: Timeline,
});

type TimelineItemType = 'event' | 'document' | 'letter' | 'deadline' | 'task';

interface TimelineItem {
  id: string;
  type: TimelineItemType;
  date: Date;
  endDate?: Date;
  title: string;
  description?: string;
  status?: string;
  originalData: any;
}

function Timeline() {
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');
  const [zoom, setZoom] = useState(100); 
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedItem, setSelectedItem] = useState<TimelineItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [visibleTypes, setVisibleTypes] = useState<Set<TimelineItemType>>(new Set(['event', 'document', 'letter', 'deadline', 'task'] as TimelineItemType[]));
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Data Fetching
  const { data: events = [] } = useQuery<CaseEvent[]>({ queryKey: ["/api/events"], queryFn: () => fetch("/api/events").then(res => res.json()) });
  const { data: docs = [] } = useQuery<Document[]>({ queryKey: ["/api/documents"], queryFn: () => fetch("/api/documents").then(res => res.json()) });
  const { data: letters = [] } = useQuery<Letter[]>({ queryKey: ["/api/letters"], queryFn: () => fetch("/api/letters").then(res => res.json()) });
  const { data: deadlines = [] } = useQuery<Deadline[]>({ queryKey: ["/api/deadlines"], queryFn: () => fetch("/api/deadlines").then(res => res.json()) });
  const { data: tasks = [] } = useQuery<Task[]>({ queryKey: ["/api/tasks"], queryFn: () => fetch("/api/tasks").then(res => res.json()) });

  // Consolidation
  const timelineItems = useMemo(() => {
    let items: TimelineItem[] = [];

    events.forEach(e => items.push({
      id: e.eventId, type: 'event', date: new Date(e.date),
      title: e.eventType, description: e.description, originalData: e
    }));

    docs.forEach(d => {
      if (d.date) items.push({
        id: d.docId, type: 'document', date: new Date(d.date),
        title: d.docType, description: d.originalFilename || d.docCode, originalData: d
      });
    });

    letters.forEach(l => {
      if (l.dateSent) items.push({
        id: l.letterId, type: 'letter', date: new Date(l.dateSent),
        title: `${l.direction} ${l.letterType}`, description: `To: ${l.recipient}`, status: l.status, originalData: l
      });
    });

    deadlines.forEach(d => items.push({
      id: d.deadlineId, type: 'deadline', date: new Date(d.startDate), endDate: new Date(d.dueDate),
      title: d.clockType, description: d.trigger, status: d.status, originalData: d
    }));

    tasks.forEach(t => {
      if (t.date) items.push({
        id: t.taskId, type: 'task', date: new Date(t.date),
        title: t.taskTitle, status: t.status, originalData: t
      });
    });

    return items
      .filter(item => visibleTypes.has(item.type))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [events, docs, letters, deadlines, tasks, visibleTypes]);

  const toggleType = (type: TimelineItemType) => {
    const next = new Set(visibleTypes);
    if (next.has(type)) next.delete(type);
    else next.add(type);
    setVisibleTypes(next);
  };

  const range = useMemo(() => {
    let start, end;
    if (viewMode === 'day') {
      start = subDays(currentDate, 3);
      end = addDays(currentDate, 7);
    } else if (viewMode === 'week') {
      start = startOfWeek(subDays(currentDate, 14));
      end = endOfWeek(addDays(currentDate, 28));
    } else {
      start = startOfMonth(subDays(currentDate, 60));
      end = endOfMonth(addDays(currentDate, 120));
    }
    return { start, end };
  }, [currentDate, viewMode]);

  const timeUnits = useMemo(() => {
    if (viewMode === 'day') return eachDayOfInterval(range);
    if (viewMode === 'week') return eachWeekOfInterval(range);
    return eachMonthOfInterval(range);
  }, [range, viewMode]);

  const unitWidth = zoom;
  const totalWidth = timeUnits.length * unitWidth;

  const getPosition = (date: Date) => {
    const diff = date.getTime() - range.start.getTime();
    const totalDiff = range.end.getTime() - range.start.getTime();
    return (diff / totalDiff) * totalWidth;
  };

  const getWidth = (start: Date, end: Date) => {
    const diff = end.getTime() - start.getTime();
    const totalDiff = range.end.getTime() - range.start.getTime();
    return (diff / totalDiff) * totalWidth;
  };

  useEffect(() => {
    if (scrollContainerRef.current) {
        const todayPos = getPosition(new Date());
        scrollContainerRef.current.scrollLeft = todayPos - scrollContainerRef.current.offsetWidth / 2;
    }
  }, [viewMode]);

  return (
    <div className="h-full flex flex-col space-y-4 animate-in fade-in duration-500 p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-primary">Case Timeline</h2>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-sm text-muted-foreground font-mono">LexChronicle Multi-Lane Viewer</p>
            <div className="flex gap-1 ml-4">
              {(['event', 'document', 'letter', 'deadline', 'task'] as TimelineItemType[]).map(t => (
                <Badge 
                  key={t}
                  variant={visibleTypes.has(t) ? "default" : "outline"}
                  className="cursor-pointer capitalize text-[10px] px-2 py-0"
                  onClick={() => toggleType(t)}
                >
                  {t}s
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-muted/30 p-2 rounded-lg border border-border">
          <Tabs value={viewMode} onValueChange={(v: any) => setViewMode(v)}>
            <TabsList className="bg-background">
              <TabsTrigger value="day">Day</TabsTrigger>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="month">Month</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-2 px-2 border-l">
            <ZoomOut className="w-4 h-4 text-muted-foreground" />
            <Slider 
              value={[zoom]} 
              min={50} max={400} step={10} 
              onValueChange={([v]) => setZoom(v)}
              className="w-32"
            />
            <ZoomIn className="w-4 h-4 text-muted-foreground" />
          </div>

          <div className="flex items-center gap-1 border-l pl-2">
            <Button variant="ghost" size="icon" onClick={() => setCurrentDate(subDays(currentDate, viewMode === 'month' ? 30 : 7))}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())} className="font-mono text-xs">Today</Button>
            <Button variant="ghost" size="icon" onClick={() => setCurrentDate(addDays(currentDate, viewMode === 'month' ? 30 : 7))}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <Card className="flex-1 overflow-hidden flex flex-col border-border shadow-inner bg-slate-50 dark:bg-slate-950/50">
        <div 
          ref={scrollContainerRef}
          className="flex-1 overflow-x-auto overflow-y-auto relative select-none"
        >
          <div style={{ width: `${totalWidth}px`, minHeight: '100%' }} className="relative">
            <div className="absolute inset-0 flex pointer-events-none">
              {timeUnits.map((unit, i) => (
                <div 
                  key={i} 
                  className="border-r border-border/40 h-full flex flex-col"
                  style={{ width: `${unitWidth}px` }}
                >
                  <div className="p-2 border-b bg-muted/20 text-[10px] font-mono font-bold text-muted-foreground uppercase sticky top-0">
                    {format(unit, viewMode === 'month' ? 'MMM yyyy' : 'MMM dd')}
                  </div>
                </div>
              ))}
            </div>

            <div className="relative pt-12 pb-8 px-4 space-y-8">
              <div 
                className="absolute top-0 bottom-0 w-px bg-primary z-10 before:content-['TODAY'] before:absolute before:top-0 before:left-1 before:text-[10px] before:font-bold before:text-primary"
                style={{ left: `${getPosition(new Date())}px` }}
              />

              <div className="space-y-4">
                <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-2 flex items-center gap-2">
                  <Clock className="w-3 h-3" /> Statutory Clocks & Deadlines
                </h3>
                <div className="relative min-h-[100px]">
                  {timelineItems.filter(i => i.type === 'deadline').map((item, idx) => (
                    <div 
                      key={item.id}
                      onClick={() => { setSelectedItem(item); setIsDialogOpen(true); }}
                      className={cn(
                        "absolute h-8 rounded-full border shadow-sm cursor-pointer hover:ring-2 ring-primary/50 transition-all flex items-center px-3 gap-2 overflow-hidden group",
                        item.status === 'Missed' ? "bg-destructive/10 border-destructive text-destructive" :
                        item.status === 'Met' ? "bg-emerald-100 border-emerald-500 text-emerald-700" :
                        "bg-amber-100 border-amber-500 text-amber-900"
                      )}
                      style={{ 
                        left: `${getPosition(item.date)}px`, 
                        width: `${item.endDate ? getWidth(item.date, item.endDate) : 100}px`,
                        top: `${idx * 40}px`
                      }}
                    >
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span className="text-xs font-bold truncate whitespace-nowrap">{item.description}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4 border-t pt-4">
                <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-2 flex items-center gap-2">
                  <GitBranch className="w-3 h-3" /> Event Log & Evidence Entries
                </h3>
                <div className="relative min-h-[300px]">
                   {timelineItems.filter(i => i.type !== 'deadline').map((item, idx) => (
                      <div 
                        key={item.id}
                        onClick={() => { setSelectedItem(item); setIsDialogOpen(true); }}
                        className="absolute group cursor-pointer flex flex-col items-center"
                        style={{ 
                          left: `${getPosition(item.date)}px`,
                          top: `${(idx % 10) * 45}px` 
                        }}
                      >
                        <div className="w-1 h-3 bg-muted-foreground/30 mb-1 group-hover:bg-primary transition-colors"></div>
                        <div className={cn(
                          "px-2 py-1 rounded border shadow-sm flex items-center gap-2 whitespace-nowrap transition-transform group-hover:scale-105 bg-white dark:bg-slate-900",
                          item.type === 'document' ? "border-blue-200 text-blue-700" :
                          item.type === 'letter' ? "border-purple-200 text-purple-700" :
                          item.type === 'task' ? "border-slate-300 text-slate-700" :
                          "border-emerald-200 text-emerald-700"
                        )}>
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold leading-none">{item.title}</span>
                            <span className="text-[9px] text-muted-foreground leading-tight truncate max-w-[120px]">{item.description}</span>
                          </div>
                        </div>
                      </div>
                   ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
               {selectedItem && (
                 <>
                   <Badge variant="outline">{selectedItem.type.toUpperCase()}</Badge>
                   {selectedItem.id}
                 </>
               )}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
             {selectedItem && (
               <>
                 <div className="grid grid-cols-2 gap-4">
                   <Card className="p-3 bg-muted/50 border-none flex flex-col">
                     <span className="text-[10px] uppercase font-bold text-muted-foreground">Original Date</span>
                     <div className="text-sm font-mono">{format(selectedItem.date, 'PPPP')}</div>
                   </Card>
                   {selectedItem.endDate && (
                      <Card className="p-3 bg-destructive/5 border-none flex flex-col">
                        <span className="text-[10px] uppercase font-bold text-destructive">Statutory Deadline</span>
                        <div className="text-sm font-mono font-bold text-destructive">{format(selectedItem.endDate, 'PPPP')}</div>
                      </Card>
                   )}
                 </div>
                 
                 <div className="p-4 border rounded-md">
                   <h4 className="font-serif font-bold text-lg mb-2">{selectedItem.title}</h4>
                   <p className="text-sm text-foreground/80 leading-relaxed">{selectedItem.description}</p>
                 </div>

                 <div className="flex justify-end pt-4 gap-2 border-t">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Close</Button>
                    <Button>Edit Record</Button>
                 </div>
               </>
             )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
