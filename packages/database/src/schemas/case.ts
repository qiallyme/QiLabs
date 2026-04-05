import { z } from 'zod';

export const caseSchema = z.object({
    id: z.string().uuid(),
    tenant_id: z.string().uuid(),
    qid: z.string().min(1).optional(),
    case_name: z.string().min(1),
    case_number: z.string().nullable().optional(),
    court: z.string().nullable().optional(),
    judge: z.string().nullable().optional(),
    opposing_counsel: z.string().nullable().optional(),
    status: z.string().default('Active'),
    description: z.string().nullable().optional(),
    created_at: z.string().datetime().optional(),
    updated_at: z.string().datetime().optional(),
});

export const deadlineSchema = z.object({
    id: z.string().uuid(),
    phase_id: z.string().uuid(),
    chronicle_event_id: z.string().uuid().nullable().optional(),
    trigger: z.string().min(1),
    clock_type: z.string().min(1),
    due_date: z.string().datetime(),
    consequence: z.string().min(1),
    status: z.string().min(1),
    created_at: z.string().datetime().optional(),
});

export type LegalCase = z.infer<typeof caseSchema>;
export type Deadline = z.infer<typeof deadlineSchema>;