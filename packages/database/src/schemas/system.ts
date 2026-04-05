import { z } from 'zod';

// Enums
export const eventSeveritySchema = z.enum(['debug', 'info', 'warning', 'error', 'critical']);
export const workerStateSchema = z.enum(['idle', 'busy', 'error', 'offline']);

// Tables: QISYS
export const systemEventSchema = z.object({
    id: z.string().uuid(),
    tenant_id: z.string().uuid().nullable().optional(),
    event_type: z.string().min(1),
    severity: eventSeveritySchema.default('info'),
    message: z.string().min(1),
    actor: z.string().nullable().optional(),
    meta: z.record(z.unknown()).default({}),
    created_at: z.string().datetime().optional(),
});

export const workerStatusSchema = z.object({
    worker_id: z.string().min(1),
    worker_name: z.string().min(1),
    worker_type: z.string().min(1),
    status: workerStateSchema.default('idle'),
    last_heartbeat: z.string().datetime().optional(),
    current_job_id: z.string().uuid().nullable().optional(),
    meta: z.record(z.unknown()).default({}),
});

// Tables: QIGRAPH
export const masterIndexSchema = z.object({
    qid: z.string().min(1), // e.g. QA3F91C
    tenant_id: z.string().uuid(),
    entity_type: z.string().min(1),
    object_id: z.string().uuid(),
    table_reference: z.string().min(1),
    title: z.string().min(1),
    route_url: z.string().nullable().optional(),
    tags: z.array(z.string()).default([]),
    is_active: z.boolean().default(true),
    created_at: z.string().datetime().optional(),
    updated_at: z.string().datetime().optional(),
});

export const graphEdgeSchema = z.object({
    id: z.string().uuid(),
    tenant_id: z.string().uuid(),
    from_qid: z.string().min(1),
    to_qid: z.string().min(1),
    link_type: z.string().min(1),
    meta: z.record(z.unknown()).default({}),
    created_at: z.string().datetime().optional(),
});

// Types
export type SystemEvent = z.infer<typeof systemEventSchema>;
export type WorkerStatus = z.infer<typeof workerStatusSchema>;
export type MasterIndex = z.infer<typeof masterIndexSchema>;
export type GraphEdge = z.infer<typeof graphEdgeSchema>;