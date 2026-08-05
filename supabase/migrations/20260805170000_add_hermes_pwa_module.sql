-- Hermes PWA module migration applied to the existing Hermes AI Supabase project.
-- Source of truth: Supabase project kjjiufximimaxbeiqmce.
-- See repository DATABASE.md for ownership, RLS and operational notes.

create schema if not exists hermes_pwa;

comment on schema hermes_pwa is 'Hermes PWA module data. References shared project_management projects and auth.users; no duplicate project identity.';

create table if not exists hermes_pwa.project_access (
  project_id uuid not null references project_management.projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  access_role text not null default 'member' check (access_role in ('owner','admin','member','viewer')),
  created_at timestamptz not null default now(),
  primary key (project_id, user_id)
);

create table if not exists hermes_pwa.github_repositories (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references project_management.projects(id) on delete cascade,
  repository_key text not null,
  provider text not null default 'github' check (provider = 'github'),
  owner text not null,
  name text not null,
  default_branch text,
  installation_id bigint,
  sync_status text not null default 'pending' check (sync_status in ('pending','syncing','ready','failed')),
  synced_at timestamptz,
  last_error text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(project_id, repository_key)
);

create table if not exists hermes_pwa.github_issues (
  id uuid primary key default gen_random_uuid(),
  repository_id uuid not null references hermes_pwa.github_repositories(id) on delete cascade,
  external_id bigint not null,
  number integer not null,
  title text not null,
  state text not null check (state in ('open','closed')),
  url text,
  labels jsonb not null default '[]'::jsonb,
  milestone jsonb,
  author_login text,
  opened_at timestamptz,
  closed_at timestamptz,
  updated_at timestamptz not null default now(),
  unique(repository_id, external_id)
);

create table if not exists hermes_pwa.github_pull_requests (
  id uuid primary key default gen_random_uuid(),
  repository_id uuid not null references hermes_pwa.github_repositories(id) on delete cascade,
  external_id bigint not null,
  number integer not null,
  title text not null,
  state text not null check (state in ('open','closed','merged')),
  url text,
  head_branch text,
  base_branch text,
  author_login text,
  opened_at timestamptz,
  merged_at timestamptz,
  updated_at timestamptz not null default now(),
  unique(repository_id, external_id)
);

create table if not exists hermes_pwa.github_sync_runs (
  id uuid primary key default gen_random_uuid(),
  repository_id uuid not null references hermes_pwa.github_repositories(id) on delete cascade,
  status text not null check (status in ('queued','running','succeeded','failed')),
  idempotency_key text not null unique,
  started_at timestamptz,
  completed_at timestamptz,
  error_message text,
  stats jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists hermes_pwa.chats (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references project_management.projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text,
  model_key text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists hermes_pwa.messages (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid not null references hermes_pwa.chats(id) on delete cascade,
  project_id uuid not null references project_management.projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('system','user','assistant','tool')),
  content text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists hermes_pwa.settings (
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid references project_management.projects(id) on delete cascade,
  theme text not null default 'dark' check (theme in ('dark','light','system')),
  notifications_enabled boolean not null default true,
  preferences jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, project_id)
);

create index if not exists project_access_user_idx on hermes_pwa.project_access(user_id, project_id);
create index if not exists github_issues_repository_state_idx on hermes_pwa.github_issues(repository_id, state, updated_at desc);
create index if not exists github_pr_repository_state_idx on hermes_pwa.github_pull_requests(repository_id, state, updated_at desc);
create index if not exists chats_project_updated_idx on hermes_pwa.chats(project_id, updated_at desc);
create index if not exists messages_chat_created_idx on hermes_pwa.messages(chat_id, created_at);

create or replace function hermes_pwa.has_project_access(p_project_id uuid)
returns boolean
language sql stable security definer
set search_path = pg_catalog, hermes_pwa
as $$
  select exists (select 1 from hermes_pwa.project_access pa where pa.project_id = p_project_id and pa.user_id = (select auth.uid()));
$$;

revoke all on function hermes_pwa.has_project_access(uuid) from public;
grant execute on function hermes_pwa.has_project_access(uuid) to authenticated;
grant usage on schema hermes_pwa to authenticated, service_role;
grant select, insert, update, delete on all tables in schema hermes_pwa to authenticated;
grant all on all tables in schema hermes_pwa to service_role;

alter table hermes_pwa.project_access enable row level security;
alter table hermes_pwa.github_repositories enable row level security;
alter table hermes_pwa.github_issues enable row level security;
alter table hermes_pwa.github_pull_requests enable row level security;
alter table hermes_pwa.github_sync_runs enable row level security;
alter table hermes_pwa.chats enable row level security;
alter table hermes_pwa.messages enable row level security;
alter table hermes_pwa.settings enable row level security;

create policy project_access_self_select on hermes_pwa.project_access for select to authenticated using (user_id = (select auth.uid()));
create policy repositories_project_select on hermes_pwa.github_repositories for select to authenticated using (hermes_pwa.has_project_access(project_id));
create policy issues_project_select on hermes_pwa.github_issues for select to authenticated using (exists (select 1 from hermes_pwa.github_repositories r where r.id = repository_id and hermes_pwa.has_project_access(r.project_id)));
create policy prs_project_select on hermes_pwa.github_pull_requests for select to authenticated using (exists (select 1 from hermes_pwa.github_repositories r where r.id = repository_id and hermes_pwa.has_project_access(r.project_id)));
create policy sync_runs_project_select on hermes_pwa.github_sync_runs for select to authenticated using (exists (select 1 from hermes_pwa.github_repositories r where r.id = repository_id and hermes_pwa.has_project_access(r.project_id)));
create policy chats_project_all on hermes_pwa.chats for all to authenticated using (hermes_pwa.has_project_access(project_id) and user_id = (select auth.uid())) with check (hermes_pwa.has_project_access(project_id) and user_id = (select auth.uid()));
create policy messages_project_all on hermes_pwa.messages for all to authenticated using (hermes_pwa.has_project_access(project_id) and user_id = (select auth.uid())) with check (hermes_pwa.has_project_access(project_id) and user_id = (select auth.uid()));
create policy settings_self_all on hermes_pwa.settings for all to authenticated using (user_id = (select auth.uid()) and (project_id is null or hermes_pwa.has_project_access(project_id))) with check (user_id = (select auth.uid()) and (project_id is null or hermes_pwa.has_project_access(project_id)));

alter default privileges in schema hermes_pwa grant select, insert, update, delete on tables to authenticated;
alter default privileges in schema hermes_pwa grant all on tables to service_role;
alter publication supabase_realtime add table hermes_pwa.github_repositories, hermes_pwa.github_issues, hermes_pwa.github_pull_requests, hermes_pwa.chats, hermes_pwa.messages;

-- Note: project_management remains the shared Hermes AI project registry.
-- The PWA does not duplicate project identity; it stores only module-specific read models and access/chat state.
