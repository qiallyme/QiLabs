import { z } from 'zod';

// Enums
export const archiveStatusSchema = z.enum([
    'registered', 'extracted', 'chunked',
    'embedded', 'routed', 'failed'
]);
export const jobStatusSchema = z.enum(['pending', 'running', 'complete', 'failed']);

// Tables
export const prefixRegistrySchema = z.object({
    domain_prefix: z.string().min(1),
    entity_type: z.string().min(1),
    entity_id: z.string().min(1),
    display_name: z.string().min(1),
    is_active: z.boolean().default(true),
    notes: z.string().nullable().optional(),
    created_at: z.string().datetime().optional(),
    updated_at: z.string().datetime().optional(),
});

export const archiveFileSchema = z.object({
    archive_id: z.string().min(1), // ULID or UUID
    domain_prefix: z.string().nullable().optional(),
    short_code: z.string().regex(/^Q[A-F0-9]{6}$/),
    original_filename: z.string().min(1),
    normalized_filename: z.string().min(1),
    sha256: z.string().length(64),
    mime_type: z.string().nullable().optional(),
    file_ext: z.string().nullable().optional(),
    source_type: z.string().nullable().optional(),
    storage_path: z.string().nullable().optional(),
    file_size: z.number().int().positive().nullable().optional(),
    status: archiveStatusSchema.default('registered'),
    route_confidence: z.number().min(0).max(1).default(0),
    extracted_text: z.string().nullable().optional(),
    metadata: z.record(z.unknown()).default({}),
    created_at: z.string().datetime().optional(),
    updated_at: z.string().datetime().optional(),
});

export const archiveChunkSchema = z.object({
    chunk_id: z.number().int().positive().optional(), // BIGSERIAL
    archive_id: z.string().min(1),
    chunk_index: z.number().int().min(0),
    text: z.string().min(1),
    embedding: z.array(z.number()).length(1536).nullable().optional(),
    embedding_model: z.string().nullable().optional(),
    metadata: z.record(z.unknown()).default({}),
    created_at: z.string().datetime().optional(),
});

// Types
export type PrefixRegistry = z.infer<typeof prefixRegistrySchema>;
export type ArchiveFile = z.infer<typeof archiveFileSchema>;
export type ArchiveChunk = z.infer<typeof archiveChunkSchema>;