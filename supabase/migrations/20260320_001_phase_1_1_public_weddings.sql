create extension if not exists pgcrypto;

create table public.weddings (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  event_name text not null,
  couple_label text,
  wedding_date date,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint weddings_slug_format_check
    check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint weddings_status_check
    check (status in ('draft', 'active', 'paused'))
);

create table public.wedding_settings (
  wedding_id uuid primary key
    references public.weddings(id) on delete cascade,
  fecha text,
  hora text,
  novio text,
  novia text,
  portada text,
  guest_home_enabled boolean not null default true,
  mostrar_programa boolean not null default true,
  mostrar_mesas boolean not null default true,
  guest_home_title text,
  guest_home_subtitle text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.wedding_program_items (
  id uuid primary key default gen_random_uuid(),
  wedding_id uuid not null
    references public.weddings(id) on delete cascade,
  sort_order integer not null default 0,
  starts_at timestamptz,
  title text not null,
  description text,
  location text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index wedding_program_items_wedding_sort_idx
  on public.wedding_program_items (wedding_id, sort_order, starts_at);
