create table if not exists registry.namespace_bands (
    id uuid primary key default gen_random_uuid(),
    band_start integer not null unique,
    band_end integer not null,
    band_label text not null unique,
    canonical_name text not null,
    status text not null default 'active',
    allocation_mode text not null default 'manual',
    metadata jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    constraint namespace_bands_status_check
        check (status in ('active','reserved','deprecated')),

    constraint namespace_bands_allocation_mode_check
        check (allocation_mode in ('fixed','manual','auto'))
);