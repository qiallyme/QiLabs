import { z } from 'zod';

export const contactTypeSchema = z.enum(['person', 'company', 'vendor', 'client']);

export const contactSchema = z.object({
    id: z.string().uuid(),
    tenant_id: z.string().uuid(),
    qid: z.string().min(1).optional(), // Links to Master Index
    contact_type: contactTypeSchema.default('person'),
    first_name: z.string().nullable().optional(),
    last_name: z.string().nullable().optional(),
    company_name: z.string().nullable().optional(),
    email: z.string().email().nullable().optional(),
    phone: z.string().nullable().optional(),
    address: z.record(z.unknown()).default({}),
    meta: z.record(z.unknown()).default({}),
    created_at: z.string().datetime().optional(),
    updated_at: z.string().datetime().optional(),
});

export type Contact = z.infer<typeof contactSchema>;