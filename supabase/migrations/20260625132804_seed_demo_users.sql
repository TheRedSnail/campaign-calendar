-- Seed one demo login per role. The empty-string token columns matter: GoTrue's login path
-- scans them into Go strings, so leaving them NULL causes a 500 on sign-in.
do $$
declare
  uid uuid;
  rec record;
begin
  for rec in
    select * from (values
      ('admin@demo.henkel',       'Avery Admin', 'admin'::app_role,                '{}'::text[],                          '{}'::text[],                 false),
      ('owner@demo.henkel',       'Olive Owner', 'campaign_owner'::app_role,        '{Industrial}'::text[],                '{Germany}'::text[],          false),
      ('coordinator@demo.henkel', 'Jan Stoker',  'campaign_coordinator'::app_role,  '{Industrial,Automotive}'::text[],     '{}'::text[],                 false),
      ('run@demo.henkel',         'Riley Run',   'run_team'::app_role,              '{}'::text[],                          '{Germany,France}'::text[],   false)
    ) as t(email, full_name, role, sbus, countries, is_global)
  loop
    if not exists (select 1 from auth.users where email = rec.email) then
      uid := gen_random_uuid();
      insert into auth.users
        (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
         created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
         confirmation_token, recovery_token, email_change_token_new, email_change,
         email_change_token_current, phone_change, phone_change_token, reauthentication_token)
      values
        ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', rec.email,
         extensions.crypt('Demo1234!', extensions.gen_salt('bf')), now(), now(), now(),
         '{"provider":"email","providers":["email"]}'::jsonb,
         jsonb_build_object('full_name', rec.full_name),
         '', '', '', '', '', '', '', '');

      insert into auth.identities
        (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
      values
        (gen_random_uuid(), uid, uid::text,
         jsonb_build_object('sub', uid::text, 'email', rec.email), 'email', now(), now(), now());

      insert into public.profiles (id, email, full_name, role, sbus, countries, is_global)
      values (uid, rec.email, rec.full_name, rec.role, rec.sbus, rec.countries, rec.is_global);
    end if;
  end loop;
end $$;
