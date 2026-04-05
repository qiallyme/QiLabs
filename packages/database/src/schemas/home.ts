import { z } from 'zod';

export const choreStatusSchema = z.enum(['open', 'done', 'skipped']);

export const categorySchema = z.object({
    id: z.string().uuid(),
    tenant_id: z.string().uuid(),
    name: z.string().min(1),
    is_active: z.boolean().default(true),
});

export const expenseSchema = z.object({
    id: z.string().uuid(),
    tenant_id: z.string().uuid(),
    date: z.string().date(),
    amount_cents: z.number().int().positive(),
    category_id: z.string().uuid().nullable().optional(),
    paid_by_user_id: z.string().uuid(),
    memo: z.string().nullable().optional(),
    archive_id: z.string().nullable().optional(), // Link to receipt
    created_by: z.string().uuid(),
    created_at: z.string().datetime().optional(),
    updated_at: z.string().datetime().optional(),
});

export const settlementSchema = z.object({
    id: z.string().uuid(),
    tenant_id: z.string().uuid(),
    date: z.string().date(),
    from_user_id: z.string().uuid(),
    to_user_id: z.string().uuid(),
    amount_cents: z.number().int().positive(),
    memo: z.string().nullable().optional(),
    created_by: z.string().uuid(),
    created_at: z.string().datetime().optional(),
});

export type Category = z.infer<typeof categorySchema>;
export type Expense = z.infer<typeof expenseSchema>;
export type Settlement = z.infer<typeof settlementSchema>;