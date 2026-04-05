import { z } from 'zod';

// Enums
export const tenantTypeSchema = z.enum(['home', 'business', 'client', 'system']);
export const memberStatusSchema = z.enum(['active', 'invited', 'disabled']);
export const accessLevelSchema = z.enum(['none', 'read', 'write', 'admin']);

// Tables
export const userSchema = z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    display_name: z.string().nullable().optional(),
    avatar_url: z.string().url().nullable().optional(),
    is_active: z.boolean().default(true),
    is_super_admin: z.boolean().default(false), // God Mode
    created_at: z.string().datetime().optional(),
    updated_at: z.string().datetime().optional(),
});

export const tenantSchema = z.object({
    id: z.string().uuid(),
    name: z.string().min(1),
    slug: z.string().min(1),
    type: tenantTypeSchema,
    metadata: z.record(z.unknown()).default({}),
    created_by: z.string().uuid().nullable(),
    created_at: z.string().datetime().optional(),
    updated_at: z.string().datetime().optional(),
});

export const tenantMemberSchema = z.object({
    id: z.string().uuid(),
    tenant_id: z.string().uuid(),
    user_id: z.string().uuid(),
    status: memberStatusSchema.default('active'),
    joined_at: z.string().datetime().optional(),
});

export const roleSchema = z.object({
    id: z.string().uuid(),
    tenant_id: z.string().uuid(),
    name: z.string().min(1),
    rank: z.number().int().default(100),
});

export const moduleRoleAccessSchema = z.object({
    tenant_id: z.string().uuid(),
    module_key: z.string(),
    role_id: z.string().uuid(),
    access_level: accessLevelSchema,
});

// Types
export type User = z.infer<typeof userSchema>;
export type Tenant = z.infer<typeof tenantSchema>;
export type TenantMember = z.infer<typeof tenantMemberSchema>;
export type Role = z.infer<typeof roleSchema>;