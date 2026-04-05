import { z } from 'zod';

export const filingKindSchema = z.enum(['original', 'amended']);
export const taxStatusSchema = z.enum(['intake', 'prep', 'review', 'signature', 'ready_to_file', 'filed', 'accepted', 'rejected']);
export const returnFileRoleSchema = z.enum(['source_doc', 'signed_form', 'draft', 'final']);

export const taxReturnSchema = z.object({
    id: z.string().uuid(),
    tenant_id: z.string().uuid(),
    tax_year: z.number().int().min(1900).max(3000),
    return_type: z.string().min(1),
    filing_kind: filingKindSchema,
    status: taxStatusSchema.default('intake'),
    version: z.number().int().min(1).default(1),
    canonical_archive_id: z.string().nullable().optional(),
    summary: z.record(z.unknown()).default({}),
    notes: z.string().nullable().optional(),
    created_by: z.string().uuid().nullable().optional(),
    created_at: z.string().datetime().optional(),
    updated_at: z.string().datetime().optional(),
});

export type TaxReturn = z.infer<typeof taxReturnSchema>;