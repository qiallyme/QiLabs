create schema if not exists registry;

create table if not exists registry.namespace_allocations (
    id uuid primary key default gen_random_uuid(),
    namespace_code text not null,
    namespace_class text not null,
    owner_type text not null,
    owner_id uuid not null,
    band_start integer not null,
    band_label text not null,
    status text not null default 'active',
    display_name text,
    notes text,
    metadata jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    constraint namespace_allocations_code_unique unique (namespace_code),

    constraint namespace_allocations_status_check
        check (status in ('active','reserved','archived','released')),

    constraint namespace_allocations_owner_type_check
        check (owner_type in ('band','tenant','matter','project','workspace','archive_partition','system')),

    constraint namespace_allocations_class_check
        check (namespace_class in ('band','tenant','matter','project','workspace','archive','lab','legacy'))
);