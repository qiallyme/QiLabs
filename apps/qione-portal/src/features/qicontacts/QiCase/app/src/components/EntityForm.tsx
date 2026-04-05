import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  insertIssueSchema, insertEventSchema, insertDocSchema, 
  insertTaskSchema, insertPhaseSchema, insertCaseSchema, 
  insertQuickLinkSchema, insertLibraryDocumentSchema,
  CasePhase,
  insertLetterSchema,
  insertDeadlineSchema,
  insertFilingSchema
} from "@repo/db/schema";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage,
  Input,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Button
} from "@repo/ui";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/query";
import { api } from "@/lib/trpc";
import { Loader2 } from "lucide-react";

type EntityType = 'issues' | 'events' | 'documents' | 'letters' | 'deadlines' | 'filings' | 'tasks' | 'phases' | 'case' | 'quick-links' | 'library';

const schemaMap = {
  issues: insertIssueSchema,
  events: insertEventSchema,
  documents: insertDocSchema,
  letters: insertLetterSchema,
  deadlines: insertDeadlineSchema,
  filings: insertFilingSchema,
  tasks: insertTaskSchema,
  phases: insertPhaseSchema,
  case: insertCaseSchema,
  'quick-links': insertQuickLinkSchema,
  library: insertLibraryDocumentSchema,
};

interface EntityFormProps {
  type: EntityType;
  initialData?: any;
  onSuccess?: () => void;
}

export function EntityForm({ type, initialData, onSuccess }: EntityFormProps) {
  const { data: phases = [] } = useQuery(api.case.getPhases.queryOptions());
  
  const form = useForm({
    resolver: zodResolver(schemaMap[type]),
    defaultValues: initialData || {
      phaseId: phases[0]?.phaseId || "",
    },
  });

  const mutation = useMutation(
    type === 'quick-links' 
      ? api.case.createQuickLink.mutationOptions()
      : type === 'library'
      ? api.case.createLibraryDocument.mutationOptions()
      : type === 'issues'
      ? (initialData ? api.case.updateIssue.mutationOptions() : api.case.createIssue.mutationOptions())
      : type === 'events'
      ? (initialData ? api.case.updateEvent.mutationOptions() : api.case.createEvent.mutationOptions())
      : type === 'documents'
      ? (initialData ? api.case.updateDocument.mutationOptions() : api.case.createDocument.mutationOptions())
      : type === 'phases'
      ? (initialData ? api.case.updatePhase.mutationOptions() : api.case.createPhase.mutationOptions())
      // Add more as needed, defaulting to a basic pattern for now
      : api.case.createIssue.mutationOptions()
  );

  const onSubmit = (data: any) => {
    if (data.order) data.order = parseInt(data.order);
    
    if (initialData) {
      const idField = Object.keys(initialData).find(k => k.endsWith('Id'));
      mutation.mutate({ id: initialData[idField as string], data });
    } else {
      mutation.mutate(data);
    }
  };


  const renderFields = () => {
    switch(type) {
      case 'issues':
        return (
          <>
            <FormField control={form.control} name="issueId" render={({ field }) => (
              <FormItem><FormLabel>Issue ID</FormLabel><FormControl><Input {...field} placeholder="ISS-01-001" /></FormControl></FormItem>
            )} />
            <FormField control={form.control} name="issueTitle" render={({ field }) => (
              <FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
            )} />
            <FormField control={form.control} name="issueStatement" render={({ field }) => (
              <FormItem><FormLabel>Statement</FormLabel><FormControl><Textarea {...field} /></FormControl></FormItem>
            )} />
            <FormField control={form.control} name="status" render={({ field }) => (
              <FormItem><FormLabel>Status</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                <SelectContent>
                  {['Open', 'Proved', 'Dismissed', 'Pending'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select></FormItem>
            )} />
          </>
        );
      case 'events':
        return (
          <>
            <FormField control={form.control} name="eventId" render={({ field }) => (
              <FormItem><FormLabel>Event ID</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
            )} />
            <FormField control={form.control} name="date" render={({ field }) => (
              <FormItem><FormLabel>Date</FormLabel><FormControl><Input type="datetime-local" {...field} value={field.value ? new Date(field.value).toISOString().slice(0, 16) : ''} onChange={e => field.onChange(new Date(e.target.value).toISOString())} /></FormControl></FormItem>
            )} />
            <FormField control={form.control} name="eventType" render={({ field }) => (
              <FormItem><FormLabel>Type</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
            )} />
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} /></FormControl></FormItem>
            )} />
          </>
        );
      case 'tasks':
        return (
          <>
            <FormField control={form.control} name="taskId" render={({ field }) => (
              <FormItem><FormLabel>Task ID</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
            )} />
            <FormField control={form.control} name="taskTitle" render={({ field }) => (
              <FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
            )} />
            <FormField control={form.control} name="status" render={({ field }) => (
              <FormItem><FormLabel>Status</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                <SelectContent>
                  {['To Do', 'In Progress', 'Blocked', 'Done'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select></FormItem>
            )} />
          </>
        );
      case 'documents':
        return (
          <>
            <FormField control={form.control} name="docId" render={({ field }) => (
              <FormItem><FormLabel>Document ID</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
            )} />
            <FormField control={form.control} name="docType" render={({ field }) => (
              <FormItem><FormLabel>Document Type</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
            )} />
            <FormField control={form.control} name="drivePath" render={({ field }) => (
              <FormItem><FormLabel>File Path/Link</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
            )} />
            <FormField control={form.control} name="proofType" render={({ field }) => (
              <FormItem><FormLabel>Proof Type</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                <SelectContent>
                  {['Direct', 'Circumstantial', 'Corroborating'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select></FormItem>
            )} />
          </>
        );
      case 'letters':
        return (
          <>
            <FormField control={form.control} name="letterId" render={({ field }) => (
              <FormItem><FormLabel>Letter ID</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
            )} />
            <FormField control={form.control} name="letterType" render={({ field }) => (
              <FormItem><FormLabel>Type</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                <SelectContent>
                  {['Dispute', 'Preservation', 'Demand', 'ADA Notice', 'Other'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select></FormItem>
            )} />
            <FormField control={form.control} name="recipient" render={({ field }) => (
              <FormItem><FormLabel>Recipient</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
            )} />
            <FormField control={form.control} name="status" render={({ field }) => (
              <FormItem><FormLabel>Status</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                <SelectContent>
                  {['Draft', 'Sent', 'Delivered', 'Failed', 'Responded'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select></FormItem>
            )} />
          </>
        );
      case 'deadlines':
        return (
          <>
            <FormField control={form.control} name="deadlineId" render={({ field }) => (
              <FormItem><FormLabel>Deadline ID</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
            )} />
            <FormField control={form.control} name="trigger" render={({ field }) => (
              <FormItem><FormLabel>Trigger</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
            )} />
            <FormField control={form.control} name="dueDate" render={({ field }) => (
              <FormItem><FormLabel>Due Date</FormLabel><FormControl><Input type="date" {...field} value={field.value ? new Date(field.value).toISOString().slice(0, 10) : ''} onChange={e => field.onChange(new Date(e.target.value).toISOString())} /></FormControl></FormItem>
            )} />
            <FormField control={form.control} name="status" render={({ field }) => (
              <FormItem><FormLabel>Status</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                <SelectContent>
                  {['Pending', 'Met', 'Missed', 'Extended'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select></FormItem>
            )} />
          </>
        );
      case 'filings':
        return (
          <>
            <FormField control={form.control} name="filingId" render={({ field }) => (
              <FormItem><FormLabel>Filing ID</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
            )} />
            <FormField control={form.control} name="title" render={({ field }) => (
              <FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
            )} />
            <FormField control={form.control} name="forum" render={({ field }) => (
              <FormItem><FormLabel>Forum</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
            )} />
            <FormField control={form.control} name="status" render={({ field }) => (
              <FormItem><FormLabel>Status</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                <SelectContent>
                  {['Filed', 'Rejected', 'Pending', 'Accepted'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select></FormItem>
            )} />
          </>
        );
      case 'phases':
        return (
          <>
            <FormField control={form.control} name="phaseId" render={({ field }) => (
              <FormItem><FormLabel>Phase ID (e.g. C-01)</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
            )} />
            <FormField control={form.control} name="phaseName" render={({ field }) => (
              <FormItem><FormLabel>Phase Name</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
            )} />
            <FormField control={form.control} name="purpose" render={({ field }) => (
              <FormItem><FormLabel>Purpose</FormLabel><FormControl><Textarea {...field} /></FormControl></FormItem>
            )} />
             <FormField control={form.control} name="status" render={({ field }) => (
              <FormItem><FormLabel>Status</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                <SelectContent>
                  {['CLOSED', 'ACTIVE', 'PENDING', 'OPTIONAL'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select></FormItem>
            )} />
             <FormField control={form.control} name="order" render={({ field }) => (
              <FormItem><FormLabel>Order (Sequence)</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>
            )} />
          </>
        );
      case 'case':
        return (
          <>
             <FormField control={form.control} name="caseName" render={({ field }) => (
              <FormItem><FormLabel>Case Name</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
            )} />
            <FormField control={form.control} name="caseNumber" render={({ field }) => (
              <FormItem><FormLabel>Case Number</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
            )} />
            <FormField control={form.control} name="court" render={({ field }) => (
              <FormItem><FormLabel>Court</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
            )} />
            <FormField control={form.control} name="judge" render={({ field }) => (
              <FormItem><FormLabel>Judge</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
            )} />
            <FormField control={form.control} name="status" render={({ field }) => (
              <FormItem><FormLabel>Status</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>

                <SelectContent>
                  {['Active', 'Closed', 'Archived'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select></FormItem>
            )} />
          </>
        )
      case 'quick-links':
        return (
          <>
            <FormField control={form.control} name="title" render={({ field }) => (
              <FormItem><FormLabel>Link Title</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
            )} />
            <FormField control={form.control} name="url" render={({ field }) => (
              <FormItem><FormLabel>URL</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
            )} />
            <FormField control={form.control} name="category" render={({ field }) => (
              <FormItem><FormLabel>Category</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                <SelectContent>
                  {['E-File', 'Court', 'Appellate', 'General'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select></FormItem>
            )} />
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} /></FormControl></FormItem>
            )} />
          </>
        )
      case 'library':
        return (
          <>
            <FormField control={form.control} name="title" render={({ field }) => (
              <FormItem><FormLabel>Document Title</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
            )} />
            <FormField control={form.control} name="source" render={({ field }) => (
              <FormItem><FormLabel>Source (e.g. Indiana Code)</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
            )} />
            <FormField control={form.control} name="url" render={({ field }) => (
              <FormItem><FormLabel>Source URL (Optional)</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
            )} />
            <FormField control={form.control} name="content" render={({ field }) => (
              <FormItem><FormLabel>Content Snippet (Optional)</FormLabel><FormControl><Textarea {...field} /></FormControl></FormItem>
            )} />
          </>
        )
      default:
        return null;
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {(type !== 'phases' && type !== 'case' && type !== 'quick-links' && type !== 'library') && (
          <FormField
            control={form.control}
            name="phaseId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Case Phase</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Select phase" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {phases.map((phase) => (
                      <SelectItem key={phase.phaseId} value={phase.phaseId}>{phase.phaseId}: {phase.phaseName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        )}
        
        {(type !== 'phases' && type !== 'case' && type !== 'quick-links' && type !== 'library') && (
        <FormField control={form.control} name="lane" render={({ field }) => (
          <FormItem><FormLabel>Lane (Optional)</FormLabel><FormControl><Input {...field} value={field.value || ''} /></FormControl></FormItem>
        )} />
        )}
        {renderFields()}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData ? "Update" : "Create"} Record
          </Button>
        </div>
      </form>
    </Form>
  );
}
