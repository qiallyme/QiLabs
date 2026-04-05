import { z } from 'zod';

export const formalDocTypeSchema = z.enum(['contract', 'html_doc', 'form_submission', 'receipt']);
export const formalDocStatusSchema = z.enum(['draft', 'sent', 'signed', 'executed', 'archived']);

export const formalDocumentSchema = z.object({
    id: z.string().uuid(),
    tenant_id: z.string().uuid(),
    qid: z.string().min(1).optional(),
    archive_id: z.string().min(1),
    doc_type: formalDocTypeSchema,
    status: formalDocStatusSchema.default('draft'),
    form_data: z.record(z.unknown()).default({}),
    signed_at: z.string().datetime().nullable().optional(),
    expires_at: z.string().datetime().nullable().optional(),
    created_at: z.string().datetime().optional(),
    updated_at: z.string().datetime().optional(),
});

export type FormalDocument = z.infer<typeof formalDocumentSchema>;