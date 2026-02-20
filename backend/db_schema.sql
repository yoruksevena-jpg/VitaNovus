-- Create CVs table
create table public.cvs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  content jsonb not null default '{}'::jsonb,
  template text default 'modern',
  score integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.cvs enable row level security;

-- Create policies
create policy "Users can view their own CVs"
  on public.cvs for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own CVs"
  on public.cvs for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own CVs"
  on public.cvs for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own CVs"
  on public.cvs for delete
  using ( auth.uid() = user_id );

-- Create updated_at trigger
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger handle_updated_at
  before update on public.cvs
  for each row
  execute procedure public.handle_updated_at();
