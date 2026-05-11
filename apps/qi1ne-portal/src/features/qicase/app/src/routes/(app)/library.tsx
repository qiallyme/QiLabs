import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { LibraryDocument } from "@repo/db/schema";
import { Card, CardTitle, Button, Badge, Input, CardHeader, CardContent, Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@repo/ui";
import { Book, Scale, Plus, Search, Loader2, Trash2, Library as LibraryIcon } from "lucide-react";
import { queryClient } from "@/lib/query";
import { EntityForm } from "@/components/EntityForm";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(app)/library")({
  component: Library,
});

function Library() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [search, setSearch] = useState("");
  
  const { data: docs = [], isLoading } = useQuery<LibraryDocument[]>({ 
    queryKey: ["/api/library"],
    queryFn: () => fetch("/api/library").then(res => res.json())
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await fetch(`/api/library/${id}`, { method: 'DELETE' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/library"] });
    }
  });

  const filteredDocs = docs.filter(doc => 
    doc.title.toLowerCase().includes(search.toLowerCase()) || 
    doc.source?.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-primary flex items-center gap-3">
            <LibraryIcon className="w-8 h-8 text-accent" />
            Legal Library
          </h1>
          <p className="text-muted-foreground mt-1 underline decoration-primary/30 decoration-2 underline-offset-4 font-medium uppercase text-xs tracking-widest">Research & Statutory References</p>
        </div>

        <div className="flex gap-2">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search laws..." 
              className="pl-9 h-10 border-border focus:ring-accent" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex gap-2 bg-primary">
                <Plus className="w-4 h-4" /> Add Volume
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add to Legal Library</DialogTitle>
              </DialogHeader>
              <EntityForm type="library" onSuccess={() => setIsDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        {filteredDocs.map((doc) => (
          <Card key={doc.id} className="group overflow-hidden border-border hover:border-accent/20 transition-all">
            <div className="flex h-full">
              <div className="w-2 bg-accent opacity-50"></div>
              <div className="flex-1 p-6 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <Badge variant="secondary" className="mb-2 text-[10px] uppercase font-bold tracking-tighter">
                      {doc.source || "Statutory"}
                    </Badge>
                    <CardTitle className="text-xl font-serif font-bold group-hover:text-accent transition-colors">
                      {doc.title}
                    </CardTitle>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => deleteMutation.mutate(doc.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4 italic">
                   {doc.content ? `"${doc.content.substring(0, 100)}..."` : "Reference book for case management and legal research."}
                </p>

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
                  <div className="flex gap-2">
                    {doc.tags?.slice(0, 2).map(tag => (
                      <Badge key={tag} variant="outline" className="text-[10px] bg-muted/30">{tag}</Badge>
                    ))}
                  </div>
                  <Button variant="outline" size="sm" className="flex gap-2 hover:bg-accent hover:text-white hover:border-accent transition-all" asChild>
                    <a href={doc.url || "#"} target="_blank" rel="noopener noreferrer">
                      <Scale className="w-3 h-3" /> View Source
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}

        {filteredDocs.length === 0 && (
          <div className="col-span-full py-20 text-center border-2 border-dashed rounded-2xl border-border/50 bg-muted/10">
            <Book className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="font-serif font-bold text-xl text-primary">Library Empty</h3>
            <p className="text-muted-foreground max-w-sm mx-auto mt-2">
              Upload PDF law books or add links to specific statutes (e.g., Indiana Code, FRCP) to build your legal reference library.
            </p>
          </div>
        )}
      </div>

      <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10 flex items-center gap-6 mt-12">
        <div className="hidden md:flex p-4 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-border">
          <Scale className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h4 className="font-serif font-bold text-lg">Recommendation for "Entire Law Books"</h4>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl leading-relaxed">
            For large volumes (like the complete Indiana Code), we recommend uploading specific PDF chapters to storage. You can then link them here for instant retrieval. In the future, we can add vectorized search to help you "talk" to your law books.
          </p>
        </div>
      </div>
    </div>
  );
}
