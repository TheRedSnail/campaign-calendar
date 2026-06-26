-- Rebuild the demo dataset to match briefs.md: new brands (Next Henkel Adhesives / Bekron /
-- Fester / OSI), SBU codes (ACA, ACE, …), the briefs.md country list, websites, and the new
-- asset/briefing JSON shape (emails / landing pages / forms / tracking pixels / localization).
-- Demo profile scoping is realigned so RLS still surfaces these rows to the demo logins.

delete from public.devops_tickets;
delete from public.campaigns;

-- Realign demo scoping to the new SBU codes (countries Germany/France remain valid).
update public.profiles set sbus = '{ACA}'::text[]     where email = 'owner@demo.henkel';
update public.profiles set sbus = '{ACA,ACE}'::text[] where email = 'coordinator@demo.henkel';

insert into public.campaigns
  (name, brand, sbu, country, website, status, progress, start_date, end_date, campaign_type,
   priority, language, cost_center, regions, channels, goal, cta, owner, owner_email, watchers,
   coordinator, notes, assets, recipients, brief_id, briefed_at, briefed_date, go_live_date)
values
('Next Henkel Adhesives 243 Relaunch','Next Henkel Adhesives','ACA','Germany','Next Henkel Adhesives','in_production',54,'2026-06-03','2026-06-12','Product relaunch','High','','',
 '{"Germany","France","Netherlands"}','{}','','','Jan Stoker','','{}',
 '','',
 '{"emails":{"selected":false,"program":"","description":"","briefingDoc":"","requestType":"Create a new Marketo program based on an existing flow/journey"},"landingPages":{"selected":false,"description":"","externalLinks":"","briefingDoc":""},"forms":{"selected":false,"description":"","externalLinks":"","briefingDoc":""},"trackingPixels":{"selected":false,"pixels":[{"vendor":"","pixelId":"","pixelType":"","script":"","paths":[{"url":"","comment":""}],"briefingDoc":""}]},"localization":{"selected":false,"languages":[]}}',
 '[{"name":"Markus Weber","role":"Owner"},{"name":"Creative team","role":""},{"name":"Localization","role":""},{"name":"Distributor mktg","role":""}]',
 null,null,'2026-06-12','2026-07-03'),

('Bekron Packaging Demo','Bekron','ACE','Germany','Bekron','ready',100,'2026-06-05','2026-06-09','Webinar','Medium','German','CC-3110',
 '{"Germany"}','{"Email","Web"}','Drive demo sign-ups from packaging OEMs','Book a live demo','M. Roth','m.roth@henkel.com','{planning@henkel.com}',
 'M. Sauer','',
 '{"emails":{"selected":true,"program":"Webinar (live)","description":"Launch announcement to OEM accounts","briefingDoc":"email-brief.pdf","requestType":"Create a new Marketo program based on an existing flow/journey"},"landingPages":{"selected":true,"description":"Drive demo sign-ups; primary CTA above the fold","externalLinks":"","briefingDoc":"landing-brief.pdf"},"forms":{"selected":true,"description":"Capture name, company, application & volume","externalLinks":"","briefingDoc":"form-brief.pdf"},"trackingPixels":{"selected":true,"pixels":[{"vendor":"Google ads","pixelId":"AW-12345678","pixelType":"Conversion","script":"<!-- Google Ads conversion -->","paths":[{"url":"/lp/demo","comment":"Landing page"}],"briefingDoc":"pixel-brief.pdf"}]},"localization":{"selected":true,"languages":["English (UK)","German"]}}',
 '[]',null,null,null,null),

('Fester Surface Prep Nurture','Fester','ACA','Germany','Fester','draft',15,'2026-06-08','2026-06-15','Nurture','Low','','',
 '{"Germany"}','{"Email"}','','','Jan Stoker','','{}',
 '','',
 '{"emails":{"selected":false,"program":"","description":"","briefingDoc":"","requestType":"Create a new Marketo program based on an existing flow/journey"},"landingPages":{"selected":false,"description":"","externalLinks":"","briefingDoc":""},"forms":{"selected":false,"description":"","externalLinks":"","briefingDoc":""},"trackingPixels":{"selected":false,"pixels":[{"vendor":"","pixelId":"","pixelType":"","script":"","paths":[{"url":"","comment":""}],"briefingDoc":""}]},"localization":{"selected":false,"languages":[]}}',
 '[]',null,null,null,null),

('OSI Auto NVH Webinar','OSI','ACE','Germany','OSI','in_progress',60,'2026-06-11','2026-06-18','Webinar','Medium','English (UK)','CC-2204',
 '{"Germany","Italy"}','{"Email","LinkedIn"}','Educate automotive engineers on NVH solutions','Register for the webinar','S. Klein','','{}',
 'Jan Stoker','',
 '{"emails":{"selected":true,"program":"Webinar (live)","description":"Webinar invite to automotive engineers","briefingDoc":"nvh-email-brief.pdf","requestType":"Create a new Marketo program based on an existing flow/journey"},"landingPages":{"selected":true,"description":"Registration page for the NVH webinar","externalLinks":"","briefingDoc":"nvh-lp-brief.pdf"},"forms":{"selected":false,"description":"","externalLinks":"","briefingDoc":""},"trackingPixels":{"selected":false,"pixels":[{"vendor":"","pixelId":"","pixelType":"","script":"","paths":[{"url":"","comment":""}],"briefingDoc":""}]},"localization":{"selected":false,"languages":[]}}',
 '[]',null,null,null,null),

('Next Henkel Adhesives Threadlocker Webinar','Next Henkel Adhesives','ACA','United Kingdom','Next Henkel Adhesives','ready',100,'2026-06-16','2026-06-19','Webinar','Medium','English (UK)','CC-4012',
 '{"United Kingdom","Germany"}','{"Email","LinkedIn","Web"}','Generate qualified leads from maintenance engineers','Save your seat','J. Stoker','j.stoker@henkel.com','{field.mktg@henkel.com}',
 'Jan Stoker','',
 '{"emails":{"selected":true,"program":"Webinar (live)","description":"Launch announcement to OEM accounts","briefingDoc":"email-brief.pdf","requestType":"Create a new Marketo program based on an existing flow/journey"},"landingPages":{"selected":true,"description":"Drive demo sign-ups; primary CTA above the fold","externalLinks":"","briefingDoc":"landing-brief.pdf"},"forms":{"selected":true,"description":"Capture name, company, application & volume","externalLinks":"","briefingDoc":"form-brief.pdf"},"trackingPixels":{"selected":true,"pixels":[{"vendor":"Google ads","pixelId":"AW-12345678","pixelType":"Conversion","script":"<!-- Google Ads conversion -->","paths":[{"url":"/lp/webinar","comment":"Registration page"}],"briefingDoc":"pixel-brief.pdf"}]},"localization":{"selected":true,"languages":["English (UK)","German"]}}',
 '[]',null,null,null,null),

('Bekron APAC EV Launch','Bekron','AMC','Singapore','Bekron','briefed',100,'2026-06-17','2026-06-22','Product launch','High','English (US)','CC-5530',
 '{"Singapore","Japan"}','{"Email","LinkedIn","Distributor portal"}','Launch EV-grade surface treatment across APAC','Request a sample','L. Vogel','l.vogel@henkel.com','{apac.mktg@henkel.com}',
 'Jan Stoker','Coordinate with APAC distributor network.',
 '{"emails":{"selected":true,"program":"Request a sample","description":"Launch announcement to OEM accounts","briefingDoc":"email-brief.pdf","requestType":"Create a new Marketo program based on an existing flow/journey"},"landingPages":{"selected":true,"description":"Drive sample requests; primary CTA above the fold","externalLinks":"","briefingDoc":"landing-brief.pdf"},"forms":{"selected":true,"description":"Capture name, company, application & volume","externalLinks":"","briefingDoc":"form-brief.pdf"},"trackingPixels":{"selected":true,"pixels":[{"vendor":"LinkedIn","pixelId":"li-998877","pixelType":"Conversion","script":"<!-- LinkedIn insight -->","paths":[{"url":"/lp/ev","comment":"Launch page"}],"briefingDoc":"pixel-brief.pdf"}]},"localization":{"selected":true,"languages":["English (US)"]}}',
 '[{"name":"L. Vogel","role":"Owner"},{"name":"APAC creative","role":""}]','ADH-2038','14 Jun 2026 · 09:12',null,null),

('Bekron EMEA Push','Bekron','ACE','Germany','Bekron','in_production',75,'2026-06-22','2026-07-03','Demand gen','High','German','CC-3140',
 '{"Germany","France","Poland"}','{"Email","SEM"}','Grow EMEA pipeline for hot-melt adhesives','Talk to an expert','M. Roth','','{}',
 'M. Sauer','',
 '{"emails":{"selected":true,"program":"New nurture journey","description":"Demand-gen nurture for hot-melt adhesives","briefingDoc":"emea-email-brief.pdf","requestType":"Create a new Marketo program based on an existing flow/journey"},"landingPages":{"selected":true,"description":"Pillar page with gated guide","externalLinks":"","briefingDoc":"emea-lp-brief.pdf"},"forms":{"selected":true,"description":"Capture contact + use case","externalLinks":"","briefingDoc":"emea-form-brief.pdf"},"trackingPixels":{"selected":false,"pixels":[{"vendor":"","pixelId":"","pixelType":"","script":"","paths":[{"url":"","comment":""}],"briefingDoc":""}]},"localization":{"selected":false,"languages":[]}}',
 '[]',null,null,'2026-06-19','2026-07-03'),

('Next Henkel Adhesives Selector Email','Next Henkel Adhesives','ACA','Germany','Next Henkel Adhesives','draft',30,'2026-06-24','2026-06-30','Newsletter','Low','','',
 '{}','{"Email"}','','','Jan Stoker','','{}',
 '','',
 '{"emails":{"selected":false,"program":"","description":"","briefingDoc":"","requestType":"Create a new Marketo program based on an existing flow/journey"},"landingPages":{"selected":false,"description":"","externalLinks":"","briefingDoc":""},"forms":{"selected":false,"description":"","externalLinks":"","briefingDoc":""},"trackingPixels":{"selected":false,"pixels":[{"vendor":"","pixelId":"","pixelType":"","script":"","paths":[{"url":"","comment":""}],"briefingDoc":""}]},"localization":{"selected":false,"languages":[]}}',
 '[]',null,null,null,null),

('OSI PU Sealant Teaser','OSI','ACE','Germany','OSI','draft',10,'2026-06-24','2026-06-29','Demand gen','Low','','',
 '{}','{}','','','Jan Stoker','','{}',
 '','',
 '{"emails":{"selected":false,"program":"","description":"","briefingDoc":"","requestType":"Create a new Marketo program based on an existing flow/journey"},"landingPages":{"selected":false,"description":"","externalLinks":"","briefingDoc":""},"forms":{"selected":false,"description":"","externalLinks":"","briefingDoc":""},"trackingPixels":{"selected":false,"pixels":[{"vendor":"","pixelId":"","pixelType":"","script":"","paths":[{"url":"","comment":""}],"briefingDoc":""}]},"localization":{"selected":false,"languages":[]}}',
 '[]',null,null,null,null),

('Fester Reorder Flow','Fester','ACA','United States','Fester','draft',20,'2026-06-27','2026-07-04','Nurture','Medium','English (US)','',
 '{"United States"}','{"Email"}','','','Jan Stoker','','{}',
 '','',
 '{"emails":{"selected":false,"program":"","description":"","briefingDoc":"","requestType":"Create a new Marketo program based on an existing flow/journey"},"landingPages":{"selected":false,"description":"","externalLinks":"","briefingDoc":""},"forms":{"selected":false,"description":"","externalLinks":"","briefingDoc":""},"trackingPixels":{"selected":false,"pixels":[{"vendor":"","pixelId":"","pixelType":"","script":"","paths":[{"url":"","comment":""}],"briefingDoc":""}]},"localization":{"selected":false,"languages":[]}}',
 '[]',null,null,null,null),

('OSI Q3 Industrial Push','OSI','ACE','Germany','OSI','in_production',50,'2026-06-29','2026-07-08','Demand gen','High','German','CC-2240',
 '{"Germany","France"}','{"Email","LinkedIn"}','Build Q3 industrial pipeline','Download the guide','P. Adler','','{}',
 'Jan Stoker','',
 '{"emails":{"selected":true,"program":"Email blast","description":"Q3 industrial push announcement","briefingDoc":"q3-email-brief.pdf","requestType":"Create a new Marketo program based on an existing flow/journey"},"landingPages":{"selected":false,"description":"","externalLinks":"","briefingDoc":""},"forms":{"selected":false,"description":"","externalLinks":"","briefingDoc":""},"trackingPixels":{"selected":false,"pixels":[{"vendor":"","pixelId":"","pixelType":"","script":"","paths":[{"url":"","comment":""}],"briefingDoc":""}]},"localization":{"selected":false,"languages":[]}}',
 '[]',null,null,'2026-06-23','2026-07-08');

-- Tickets for the campaigns that start life in production (link by unique campaign name).
insert into public.devops_tickets (id, campaign_id, team, title, stage, sla, assignee, due_date)
select v.id, c.id, v.team, v.title, v.stage, v.sla, v.assignee, v.due_date
from (values
  ('ADH-2031-EMAIL','Next Henkel Adhesives 243 Relaunch','CRM / Email','Email build & send','Ready for UAT','On track','S. Klein','02 Jul'),
  ('ADH-2031-WEB','Next Henkel Adhesives 243 Relaunch','Web & Landing','Landing page + form + tracking','Briefed','Overdue','Unassigned','30 Jun'),
  ('ADH-2031-PAID','Next Henkel Adhesives 243 Relaunch','Paid Media','Search & display campaigns','Live','On track','P. Adler','24 Jun'),
  ('ADH-2031-SOCIAL','Next Henkel Adhesives 243 Relaunch','Social','Organic + paid social assets','In progress','On track','L. Vogel','01 Jul'),
  ('ADH-2034-EMAIL','Bekron EMEA Push','CRM / Email','Email build & send','In progress','On track','S. Klein','03 Jul'),
  ('ADH-2034-PAID','Bekron EMEA Push','Paid Media','Search & display campaigns','In progress','At risk','P. Adler','03 Jul'),
  ('ADH-2036-EMAIL','OSI Q3 Industrial Push','CRM / Email','Email build & send','In progress','On track','S. Klein','08 Jul'),
  ('ADH-2036-SOCIAL','OSI Q3 Industrial Push','Social','Organic + paid social assets','In progress','On track','L. Vogel','08 Jul')
) as v(id, campaign_name, team, title, stage, sla, assignee, due_date)
join public.campaigns c on c.name = v.campaign_name;
