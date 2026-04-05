import { z } from 'zod';
import fs from 'fs';
import path from 'path';

export const RepoRulesSchema = z.object({
    ignore_globs: z.array(z.string()),
    filename: z.object({
        no_spaces: z.boolean(),
        allowed_chars_regex: z.string(),
        max_base_len: z.number(),
        prefer_underscore: z.boolean(),
    }),
    foldername: z.object({
        capitalization: z.enum(['titlecase', 'lowercase', 'camelcase', 'sentencecase']),
        allowed_regex: z.string(),
        overrides: z.array(z.object({
            pattern: z.string(),
            capitalization: z.enum(['titlecase', 'lowercase', 'camelcase', 'sentencecase']),
        })),
    }),
    dates: z.object({
        format: z.string(),
        content_prefix_required: z.boolean(),
        prefix_separator: z.string(),
    }),
    pdf: z.object({
        max_mb: z.number(),
        require_ocr: z.boolean(),
        remove_blank_pages: z.boolean(),
        split_if_pages_gt: z.number().nullable(),
        single_page_to_images: z.boolean(),
        scan_paths: z.array(z.string()),
    }),
});

export type RepoRules = z.infer<typeof RepoRulesSchema>;

export function loadRepoRules(rootPath: string): RepoRules {
    const configPath = path.join(rootPath, 'repo.rules.json');
    if (!fs.existsSync(configPath)) {
        throw new Error(`Config file not found: ${configPath}`);
    }
    const rawData = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    return RepoRulesSchema.parse(rawData);
}
