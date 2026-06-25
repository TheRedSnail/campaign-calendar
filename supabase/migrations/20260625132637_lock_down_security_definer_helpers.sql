-- These helpers exist only to back RLS policies; they should not be public RPC endpoints.
-- Revoke the implicit PUBLIC/anon EXECUTE; the explicit grant to `authenticated` remains so
-- the policies (all scoped `to authenticated`) keep working.
revoke execute on function public.auth_role()                 from public, anon;
revoke execute on function public.auth_sbus()                 from public, anon;
revoke execute on function public.auth_countries()            from public, anon;
revoke execute on function public.auth_is_global()            from public, anon;
revoke execute on function public.can_see_campaign(text,text) from public, anon;
