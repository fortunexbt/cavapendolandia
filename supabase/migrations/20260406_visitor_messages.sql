-- Visitor contact messages
CREATE TYPE public.visitor_message_category AS ENUM ('domanda', 'richiesta', 'feedback');
CREATE TYPE public.visitor_message_status AS ENUM ('unread', 'read', 'archived');

CREATE TABLE public.visitor_messages (
  id uuid primary key default gen_random_uuid(),
  visitor_name text,
  visitor_email text,
  message text not null,
  category public.visitor_message_category not null,
  locale text not null default 'it',
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

ALTER TABLE public.visitor_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_insert_visitor_messages" ON public.visitor_messages
  FOR INSERT WITH CHECK (true);
CREATE POLICY "admin_read_visitor_messages" ON public.visitor_messages
  FOR SELECT USING (
    exists (
      select 1 from public.user_roles 
      where user_id = auth.uid() and role = 'admin'
    )
  );
CREATE POLICY "admin_update_visitor_messages" ON public.visitor_messages
  FOR UPDATE USING (
    exists (
      select 1 from public.user_roles 
      where user_id = auth.uid() and role = 'admin'
    )
  );
