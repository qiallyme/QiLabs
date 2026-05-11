import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, Badge, Input, Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, Button } from "@repo/ui";
import { cn } from "@repo/ui/lib/utils";
import { Search, Filter, ArrowUpRight, Loader2, Plus } from "lucide-react";
import { EntityForm } from "@/components/EntityForm";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(app)/table-data")({
  component: TableDataPage,
});

type TableType = 'issues' | 'events' | 'documents' | 'letters' | 'deadlines' | 'filings' | 'tasks';

const titleMap: Record<TableType, string> = {
  issues: "Issues & Facts",
  events: "Event Log",
  documents: "Evidence Locker",
  letters: "Correspondence",
  deadlines: "Statutory Deadlines",
  filings: "Court Filings",
  tasks: "Execution Tasks",
};

const idFieldMap: Record<TableType, string> = {
  issues: "issueId",
  events: "eventId",
  documents: "docId",
  letters: "letterId",
  deadlines: "deadlineId",
  filings: "filingId",
  tasks: "taskId",
};

function TableDataPage() {
  const [type, setType] = useState<TableType>('issues');

  return (
    <div className="p-6 space-y-6">
      <div className="flex gap-2 border-b pb-4 overflow-x-auto">
        {(Object.keys(titleMap) as TableType[]).map(t => (
          <Button 
            key={t} 
            variant={type === t ? "default" : "ghost"} 
            size="sm"
            onClick={() => setType(t)}
            className="whitespace-nowrap"
          >
            {titleMap[t]}
          </Button>
        ))}
      </div>
      <TableView type={type} />
    </div>
  );
}

function TableView({ type }: { type: TableType }) {
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  
  const { data: records = [], isLoading } = useQuery<any[]>({ 
    queryKey: [`/api/${type}`],
    queryFn: () => fetch(`/api/${type}`).then(res => res.json())
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const filteredData = Array.isArray(records) ? records.filter((item: any) => 
    Object.values(item).some(val => 
      String(val).toLowerCase().includes(search.toLowerCase())
    )
  ) : [];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-primary">{titleMap[type]}</h2>
          <p className="text-sm text-muted-foreground font-mono mt-1">Total Records: {filteredData.length}</p>
        </div>
        
        <div className="flex gap-2 items-center">
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) setEditingRecord(null);
          }}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingRecord(null)} className="flex gap-2">
                <Plus className="w-4 h-4" /> Add Record
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>{editingRecord ? "Edit" : "Add New"} {titleMap[type].slice(0, -1)}</DialogTitle>
              </DialogHeader>
              <EntityForm 
                type={type} 
                initialData={editingRecord} 
                onSuccess={() => setIsDialogOpen(false)} 
              />
            </DialogContent>
          </Dialog>

          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search records..." 
              className="pl-8 bg-white dark:bg-slate-950"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Badge variant="outline" className="h-10 px-3 cursor-pointer hover:bg-muted flex gap-2 items-center">
            <Filter className="w-4 h-4" /> Filter
          </Badge>
        </div>
      </div>

      <Card className="overflow-hidden border-border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                {Object.keys(filteredData[0] || {}).map((key) => (
                  <th key={key} className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-muted-foreground font-sans">
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
                  </th>
                ))}
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 bg-card">
              {filteredData.map((row: any) => (
                <tr key={row[idFieldMap[type]]} className="hover:bg-muted/20 transition-colors group">
                  {Object.entries(row).map(([key, value], i) => (
                    <td key={key} className="px-6 py-4 align-top">
                      {i === 0 ? (
                        <span className="font-mono text-xs font-bold text-primary">{String(value)}</span>
                      ) : key === 'status' ? (
                         <Badge variant="outline" className={cn(
                           "font-bold text-[10px] uppercase tracking-wide",
                           value === 'Missed' ? "bg-destructive/10 text-destructive border-destructive/20" :
                           ['Proved', 'Met', 'Done', 'Delivered', 'CLOSED'].includes(String(value)) ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                           "bg-slate-100 text-slate-700"
                         )}>
                           {String(value)}
                         </Badge>
                      ) : key === 'strength' ? (
                        <div className="flex gap-0.5">
                           {Array.from({length: 5}).map((_, idx) => (
                             <div key={idx} className={cn(
                               "w-1.5 h-4 rounded-sm",
                               idx < (value as number) ? "bg-primary" : "bg-muted"
                             )} />
                           ))}
                        </div>
                      ) : key.toLowerCase().includes('date') && value ? (
                        <span className="text-foreground/80 leading-relaxed font-mono text-xs text-nowrap">
                           {new Date(value as string).toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="text-foreground/80 leading-relaxed">
                           {String(value).length > 60 ? String(value).slice(0, 60) + "..." : String(value)}
                        </span>
                      )}
                    </td>
                  ))}
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => {
                        setEditingRecord(row);
                        setIsDialogOpen(true);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-2 hover:bg-muted rounded text-muted-foreground hover:text-primary transition-all"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center text-muted-foreground">
                    No records found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
