import { z } from 'zod';

export const senderTypeSchema = z.enum(['user', 'assistant', 'system']);
export const sessionTypeSchema = z.enum(['ai_chat', 'direct_message', 'group_channel']);
export const sensitivitySchema = z.enum(['public', 'internal', 'confidential']);

export const noteSchema = z.object({
    id: z.string().uuid(),
    tenant_id: z.string().uuid(),
    qid: z.string().min(1),
    title: z.string().min(1),
    slug: z.string().min(1),
    content_md: z.string().nullable().optional(),
    content_html: z.string().nullable().optional(),
    sensitivity: sensitivitySchema.default('internal'),
    author_id: z.string().uuid().nullable().optional(),
    meta: z.record(z.unknown()).default({}),
    created_at: z.string().datetime().optional(),
    updated_at: z.string().datetime().optional(),
});

export const sessionSchema = z.object({
    id: z.string().uuid(),
    tenant_id: z.string().uuid(),
    title: z.string().nullable().optional(),
    session_type: sessionTypeSchema.default('ai_chat'),
    is_active: z.boolean().default(true),
    created_at: z.string().datetime().optional(),
    updated_at: z.string().datetime().optional(),
});

export const messageSchema = z.object({
    id: z.string().uuid(),
    session_id: z.string().uuid(),
    sender_type: senderTypeSchema,
    sender_id: z.string().uuid().nullable().optional(),
    content: z.string().min(1),
    tokens_consumed: z.number().int().default(0),
    meta: z.record(z.unknown()).default({}),
    created_at: z.string().datetime().optional(),
});

// Types
export type Note = z.infer<typeof noteSchema>;
export type Session = z.infer<typeof sessionSchema>;
export type Message = z.infer<typeof messageSchema>;