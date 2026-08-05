-- Seed the five application/website projects shown in Hermes PWA.
-- Idempotent by project_key; the system-owned Hermes AI record is preserved.
insert into project_management.projects (
  project_key, name, description, category_id, status_id, owner_key,
  priority, progress_percent, metadata
)
select v.project_key, v.name, v.description, c.id, s.id, 'kevin',
       v.priority, v.progress_percent, v.metadata::jsonb
from (
  values
    ('parallax-studio', 'Parallax Studio', 'Digital product studio and operating system for building apps, websites and AI products.', 1::smallint, 0::numeric, '{"source":"hermes_pwa","visible":true}'::text),
    ('costapulse', 'CostaPulse', 'Premium booking platform for Costa Blanca experiences, yacht charters, watersports and concierge services.', 1::smallint, 0::numeric, '{"source":"hermes_pwa","visible":true}'::text),
    ('wild-sky-ride', 'WildSkyRide', 'Application project for the Wild Sky Ride experience.', 1::smallint, 0::numeric, '{"source":"hermes_pwa","visible":true}'::text),
    ('bankruptto1million', 'BankruptTo1Million', 'Building-in-public movement and community platform.', 1::smallint, 0::numeric, '{"source":"hermes_pwa","visible":true}'::text),
    ('hermes-pwa', 'Hermes PWA', 'Central AI project dashboard and development command center.', 1::smallint, 0::numeric, '{"source":"hermes_pwa","visible":true}'::text)
) as v(project_key, name, description, priority, progress_percent, metadata)
join project_management.project_categories c on c.name = 'Software'
join project_management.project_statuses s on s.name = 'Active'
on conflict (project_key) do update set
  name = excluded.name,
  description = excluded.description,
  category_id = excluded.category_id,
  status_id = excluded.status_id,
  metadata = excluded.metadata,
  updated_at = now();
