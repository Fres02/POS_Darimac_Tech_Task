-- security definer: lets RLS policies check the caller's role without
-- being blocked by (or recursing into) the RLS policy on `profiles` itself.
create function is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and role = 'admin'
  );
$$;
