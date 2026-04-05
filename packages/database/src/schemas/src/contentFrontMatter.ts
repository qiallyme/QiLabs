import { z } from 'zod';

/**
 * Universal Content Front Matter Schema
 */
export const ContentFrontMatterSchema = z.object({
    dna_id: z.string().uuid().describe('Immutable UUID v4 identity'),
    canonical_name: z.string().min(1).describe('Stable human label'),
    title: z.string().min(1),
    type: z.enum(['blog', 'doc', 'kb', 'legal', 'note', 'page', 'spec', 'changelog', 'incident', 'template']),
    module: z.string().min(1).describe('Product/site context'),
    slug: z.string().optional().describe('URL segment'),
    visibility: z.enum(['public', 'internal', 'private', 'client']).default('internal'),
    status: z.enum(['draft', 'review', 'published', 'archived']).default('draft'),
    tags: z.array(z.string()).default([]),
    version: z.number().int().default(1),
    created: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe('ISO date YYYY-MM-DD'),
    updated: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe('ISO date YYYY-MM-DD'),
}).passthrough(); // Allow unknown keys for app-specific data

export type ContentFrontMatter = z.infer<typeof ContentFrontMatterSchema>;

/**
 * Helpers
 */
export const isUuidV4 = (str: string): boolean => {
    const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidV4Regex.test(str);
};

export const getTodayISO = (): string => new Date().toISOString().split('T')[0];

export const normalizeFrontMatter = (obj: any): ContentFrontMatter => {
    // We don't use .parse here because we want to be able to handle "dirty" inputs
    // during the indexing phase. We'll rely on the indexing script to "heal" the data.
    return obj as ContentFrontMatter;
};
