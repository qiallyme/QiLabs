import { z } from 'zod';

export const sensitivitySchema = z.enum(['public', 'internal', 'confidential']);
export const postStatusSchema = z.enum(['draft', 'scheduled', 'published', 'archived']);

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

export const postSchema = z.object({
    id: z.string().uuid(),
    tenant_id: z.string().uuid(),
    qid: z.string().min(1).nullable().optional(),
    title: z.string().min(1),
    slug: z.string().min(1),
    status: postStatusSchema.default('draft'),
    content_md: z.string().min(1),
    excerpt: z.string().nullable().optional(),
    featured_image_archive_id: z.string().nullable().optional(),
    author_id: z.string().uuid().nullable().optional(),
    published_at: z.string().datetime().nullable().optional(),
    created_at: z.string().datetime().optional(),
    updated_at: z.string().datetime().optional(),
});

export type Note = z.infer<typeof noteSchema>;
export type Post = z.infer<typeof postSchema>;