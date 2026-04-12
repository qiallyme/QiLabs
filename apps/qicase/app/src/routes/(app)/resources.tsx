import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { QuickLink } from "@repo/db/schema";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button, Input, Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, Badge } from "@repo/ui";
import { ExternalLink, Plus, Globe, Shield, Gavel, BookOpen, Loader2, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/query";
import { EntityForm } from "@/components/EntityForm";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(app)/resources")({
  component: Resources,
});

const categoryIcons: Record<string, any> = {
  "E-File": Shield,
  "Court": Gavel,
  "Appellate": BookOpen,
  "General": Globe,
};

import { api } from "@/lib/trpc";

function Resources() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const { data: links = [], isLoading } = useQuery(api.case.getQuickLinks.queryOptions());

  const deleteMutation = useMutation(api.case.deleteQuickLink.mutationOptions());


  const defaultLinks = [
    { title: "Indiana MyCase", url: "https://public.courts.in.gov/mycase", category: "Court", description: "Search court records and case information." },
    { title: "E-File Indiana", url: "https://www.efile.com", category: "E-File", description: "Submit court filings electronically." },
    { title: "Appellate Court", url: "https://www.in.gov/courts/appellate/", category: "Appellate", description: "Indiana Court of Appeals and Supreme Court resources." },
  ];

  const allLinks = links.length > 0 ? links : defaultLinks.map((l, i) => ({ ...l, id: `default-${i}` } as unknown as QuickLink));

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
          <h1 className="text-3xl font-serif font-bold text-primary">External Resources</h1>
          <p className="text-muted-foreground mt-1 underline decoration-accent/30 decoration-2 underline-offset-4 font-medium uppercase text-xs tracking-widest">Legal Portal & Quick Links</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex gap-2">
              <Plus className="w-4 h-4" /> Add Web Tab
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Quick Link</DialogTitle>
            </DialogHeader>
            <EntityForm type="quick-links" onSuccess={() => setIsDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {allLinks.map((link) => {
          const Icon = categoryIcons[link.category || "General"] || Globe;
          return (
            <Card key={link.id} className="group relative overflow-hidden border-border hover:border-primary/20 transition-all hover:shadow-lg">
              <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {!String(link.id).startsWith('default-') && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => deleteMutation.mutate(link.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="p-2 bg-primary/5 rounded-lg">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <Badge variant="outline" className="text-[10px] uppercase font-bold text-muted-foreground">
                    {link.category}
                  </Badge>
                </div>
                <CardTitle className="mt-4 text-xl font-serif group-hover:text-primary transition-colors">
                  {link.title}
                </CardTitle>
                <CardDescription className="line-clamp-2 min-h-[2.5rem] mt-2 leading-relaxed">
                  {link.description || "Quick access to legal portal."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  asChild 
                  className="w-full mt-4"
                >
                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                    Open Resource <ExternalLink className="w-4 h-4" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-12 p-8 border border-dashed rounded-xl bg-muted/20 text-center">
        <h3 className="text-lg font-serif font-bold text-primary mb-2">Secure Embedded View (Beta)</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Some legal portals prevent direct embedding for security. We recommend opening them in a new tab for full functionality and security.
        </p>
      </div>
    </div>
  );
}
