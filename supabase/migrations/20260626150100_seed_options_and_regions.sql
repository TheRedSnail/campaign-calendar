-- Backfill the new config tables from the previously-hardcoded src/data/options.ts lists so
-- behavior is unchanged on day one. Region names are kept EXACTLY as they appeared in the flat
-- list (mixed dashes and all) so existing campaign.regions / profile scope strings still match.

-- ---- flat option lists ---------------------------------------------------
insert into public.app_options (kind, value, label, sort_order)
select 'sbu', v, v, ord from unnest(array[
  'ACA','ACE','ACC','AMC','AME','AMI','AMO','APC','APP','AQC'
]) with ordinality as t(v, ord)
on conflict (kind, value) do nothing;

insert into public.app_options (kind, value, label, sort_order)
select 'brand', v, v, ord from unnest(array[
  'Next Henkel Adhesives','Bekron','Fester','OSI'
]) with ordinality as t(v, ord)
on conflict (kind, value) do nothing;

insert into public.app_options (kind, value, label, sort_order)
select 'campaign_type', v, v, ord from unnest(array[
  'Product relaunch','Product launch','Webinar','Nurture','Demand gen','Event','Newsletter'
]) with ordinality as t(v, ord)
on conflict (kind, value) do nothing;

insert into public.app_options (kind, value, label, sort_order)
select 'priority', v, v, ord from unnest(array[
  'Low','Medium','High','Critical'
]) with ordinality as t(v, ord)
on conflict (kind, value) do nothing;

insert into public.app_options (kind, value, label, sort_order)
select 'language', v, v, ord from unnest(array[
  'English (UK)','English (US)','German','French','Dutch','Spanish','Italian'
]) with ordinality as t(v, ord)
on conflict (kind, value) do nothing;

insert into public.app_options (kind, value, label, sort_order)
select 'website', v, v, ord from unnest(array[
  'Agorex','Bekron','Beta Website','Bonderite','Cascola','Ceresit','Cimsec',
  'Contacts Henkel Adhesives','Fester','Glooly','Henkel Brand Hub','Henkel FQCE',
  'Humidity Absorber','LePage','Loctite','Makroflex','Metylan','Moment',
  'Next Henkel Adhesives','Oneweb','OSI','Other / External','Pattex','Perfax',
  'Polybit','Pritt','Resistol','Rubson','Sista','Solvite','Tangit','Teroson',
  'Thomsit','YouJustDo'
]) with ordinality as t(v, ord)
on conflict (kind, value) do nothing;

insert into public.app_options (kind, value, label, sort_order)
select 'channel', v, v, ord from unnest(array[
  'Email','LinkedIn','Distributor portal','Web','Social','SEM','Print / PDF','Display banner'
]) with ordinality as t(v, ord)
on conflict (kind, value) do nothing;

insert into public.app_options (kind, value, label, sort_order)
select 'email_program', v, v, ord from unnest(array[
  'Email blast','Newsletter','Content download','Masterclass on demand','Discover nurture',
  'New nurture journey','Request a consultation','Request a quote','Request a sample',
  'Event','Webinar (live)'
]) with ordinality as t(v, ord)
on conflict (kind, value) do nothing;

insert into public.app_options (kind, value, label, sort_order)
select 'pixel_vendor', v, v, ord from unnest(array[
  'Facebook (meta)','Google ads','Bing','Youtube','Instagram (meta)','TikTok','Snapchat',
  'Pinterest','X (Twitter)','LinkedIn','Other (please describe in comments)'
]) with ordinality as t(v, ord)
on conflict (kind, value) do nothing;

insert into public.app_options (kind, value, label, sort_order)
select 'owner', v, v, ord from unnest(array[
  'Markus Weber','M. Roth','S. Klein','J. Stoker','L. Vogel','P. Adler','A. Weber'
]) with ordinality as t(v, ord)
on conflict (kind, value) do nothing;

-- ---- regions (exact legacy names) ----------------------------------------
insert into public.regions (name, sort_order)
select v, ord from unnest(array[
  'Regional - APAC',
  'Regional - Middle East and Africa',
  'Regional – Eastern Europe',
  'Regional – North America',
  'Regional – Western Europe',
  'Regional- Latin America'
]) with ordinality as t(v, ord)
on conflict (name) do nothing;

-- ---- countries → region (best-effort mapping; admin can adjust in settings) ----
insert into public.countries (name, region_id, sort_order)
select c.name,
       (select id from public.regions r where r.name = c.region_name),
       row_number() over (order by c.name)
from (values
  ('Algeria','Regional - Middle East and Africa'),
  ('Argentina','Regional- Latin America'),
  ('Australia','Regional - APAC'),
  ('Austria','Regional – Western Europe'),
  ('Belgium','Regional – Western Europe'),
  ('Brazil','Regional- Latin America'),
  ('Bulgaria','Regional – Eastern Europe'),
  ('Canada','Regional – North America'),
  ('Chile','Regional- Latin America'),
  ('Colombia','Regional- Latin America'),
  ('Costa Rica','Regional- Latin America'),
  ('Croatia','Regional – Eastern Europe'),
  ('Czech Republic','Regional – Eastern Europe'),
  ('Denmark','Regional – Western Europe'),
  ('El Salvador','Regional- Latin America'),
  ('Estonia','Regional – Eastern Europe'),
  ('Finland','Regional – Western Europe'),
  ('France','Regional – Western Europe'),
  ('Germany','Regional – Western Europe'),
  ('Greece','Regional – Western Europe'),
  ('Guatemala','Regional- Latin America'),
  ('Honduras','Regional- Latin America'),
  ('Hungary','Regional – Eastern Europe'),
  ('India','Regional - APAC'),
  ('Indonesia','Regional - APAC'),
  ('Ireland','Regional – Western Europe'),
  ('Israel','Regional - Middle East and Africa'),
  ('Italy','Regional – Western Europe'),
  ('Japan','Regional - APAC'),
  ('Kenya','Regional - Middle East and Africa'),
  ('Latvia','Regional – Eastern Europe'),
  ('Lithuania','Regional – Eastern Europe'),
  ('Malaysia','Regional - APAC'),
  ('Mexico','Regional- Latin America'),
  ('Morocco','Regional - Middle East and Africa'),
  ('Netherlands','Regional – Western Europe'),
  ('New Zealand','Regional - APAC'),
  ('Nicaragua','Regional- Latin America'),
  ('Norway','Regional – Western Europe'),
  ('Pakistan','Regional - APAC'),
  ('Panama','Regional- Latin America'),
  ('Peru','Regional- Latin America'),
  ('Philippines','Regional - APAC'),
  ('Poland','Regional – Eastern Europe'),
  ('Portugal','Regional – Western Europe'),
  ('Romania','Regional – Eastern Europe'),
  ('Serbia','Regional – Eastern Europe'),
  ('Singapore','Regional - APAC'),
  ('Slovakia','Regional – Eastern Europe'),
  ('Slovenia','Regional – Eastern Europe'),
  ('South Africa','Regional - Middle East and Africa'),
  ('South Korea','Regional - APAC'),
  ('Spain','Regional – Western Europe'),
  ('Sweden','Regional – Western Europe'),
  ('Switzerland','Regional – Western Europe'),
  ('Taiwan','Regional - APAC'),
  ('Thailand','Regional - APAC'),
  ('Tunisia','Regional - Middle East and Africa'),
  ('Turkey','Regional - Middle East and Africa'),
  ('Ukraine','Regional – Eastern Europe'),
  ('United Arab Emirates','Regional - Middle East and Africa'),
  ('United Kingdom','Regional – Western Europe'),
  ('United States','Regional – North America'),
  ('Vietnam','Regional - APAC')
) as c(name, region_name)
on conflict (name) do nothing;
