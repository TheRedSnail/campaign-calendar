insert into public.campaigns
  (name, brand, sbu, country, status, progress, start_date, end_date, campaign_type, priority,
   language, cost_center, regions, channels, goal, cta, owner, owner_email, coordinator, notes,
   assets, recipients, brief_id, briefed_at, briefed_date, go_live_date)
values
('Loctite 243 Relaunch','Loctite','Industrial','Germany','in_production',54,'2026-06-03','2026-06-12','Product relaunch','High','','',
 '{"Germany","France","Netherlands"}','{}','','','','','Jan Stoker','',
 '{"emailBriefing":{"selected":false,"brief":"","reference":"","briefingDoc":""},"landingPages":{"selected":false,"brief":"","reference":"","briefingDoc":""},"forms":{"selected":false,"brief":"","reference":"","briefingDoc":""},"trackingPixels":{"selected":false,"provider":"","pixelId":"","events":""},"localization":{"selected":false,"languages":[]}}',
 '[{"name":"Markus Weber","role":"Owner"},{"name":"Creative team","role":""},{"name":"Localization","role":""},{"name":"Distributor mktg","role":""}]',
 null,null,'2026-06-12','2026-07-03'),

('Technomelt Packaging Demo','Technomelt','Packaging','Germany','ready',100,'2026-06-05','2026-06-09','Webinar','Medium','German','CC-3110',
 '{"Germany"}','{"Email","Web"}','Drive demo sign-ups from packaging OEMs','Book a live demo','M. Roth','m.roth@henkel.com','M. Sauer','',
 '{"emailBriefing":{"selected":true,"brief":"Launch announcement to OEM accounts","reference":"","briefingDoc":"email-brief.pdf"},"landingPages":{"selected":true,"brief":"Drive demo sign-ups; primary CTA above the fold","reference":"henkel.com/lp","briefingDoc":"landing-brief.pdf"},"forms":{"selected":true,"brief":"Capture name, company, application & volume","reference":"","briefingDoc":"form-brief.pdf"},"trackingPixels":{"selected":true,"provider":"GA4","pixelId":"G-XXXX1234","events":"page_view, sign_up"},"localization":{"selected":true,"languages":["English (UK)","German"]}}',
 '[]',null,null,null,null),

('Bonderite Surface Prep Nurture','Bonderite','General Manufacturing','United States','draft',15,'2026-06-08','2026-06-15','Nurture','Low','','',
 '{"United States"}','{"Email"}','','','','','Jan Stoker','',
 '{"emailBriefing":{"selected":false,"brief":"","reference":"","briefingDoc":""},"landingPages":{"selected":false,"brief":"","reference":"","briefingDoc":""},"forms":{"selected":false,"brief":"","reference":"","briefingDoc":""},"trackingPixels":{"selected":false,"provider":"","pixelId":"","events":""},"localization":{"selected":false,"languages":[]}}',
 '[]',null,null,null,null),

('Teroson Auto NVH Webinar','Teroson','Automotive','Germany','in_progress',60,'2026-06-11','2026-06-18','Webinar','Medium','English (UK)','CC-2204',
 '{"Germany","Italy"}','{"Email","LinkedIn"}','Educate automotive engineers on NVH solutions','Register for the webinar','S. Klein','','Jan Stoker','',
 '{"emailBriefing":{"selected":true,"brief":"Webinar invite to automotive engineers","reference":"","briefingDoc":"nvh-email-brief.pdf"},"landingPages":{"selected":true,"brief":"Registration page for the NVH webinar","reference":"","briefingDoc":"nvh-lp-brief.pdf"},"forms":{"selected":false,"brief":"","reference":"","briefingDoc":""},"trackingPixels":{"selected":false,"provider":"","pixelId":"","events":""},"localization":{"selected":false,"languages":[]}}',
 '[]',null,null,null,null),

('Loctite Threadlocker Webinar','Loctite','Industrial','United Kingdom','ready',100,'2026-06-16','2026-06-19','Webinar','Medium','English (UK)','CC-4012',
 '{"United Kingdom","Germany"}','{"Email","LinkedIn","Web"}','Generate qualified leads from maintenance engineers','Save your seat','J. Stoker','j.stoker@henkel.com','Jan Stoker','',
 '{"emailBriefing":{"selected":true,"brief":"Launch announcement to OEM accounts","reference":"","briefingDoc":"email-brief.pdf"},"landingPages":{"selected":true,"brief":"Drive demo sign-ups; primary CTA above the fold","reference":"henkel.com/lp","briefingDoc":"landing-brief.pdf"},"forms":{"selected":true,"brief":"Capture name, company, application & volume","reference":"","briefingDoc":"form-brief.pdf"},"trackingPixels":{"selected":true,"provider":"GA4","pixelId":"G-XXXX1234","events":"page_view, sign_up"},"localization":{"selected":true,"languages":["English (UK)","German"]}}',
 '[]',null,null,null,null),

('Bonderite APAC EV Launch','Bonderite','Automotive','China','briefed',100,'2026-06-17','2026-06-22','Product launch','High','English (US)','CC-5530',
 '{"China","Japan"}','{"Email","LinkedIn","Distributor portal"}','Launch EV-grade surface treatment across APAC','Request a sample','L. Vogel','l.vogel@henkel.com','Jan Stoker','Coordinate with APAC distributor network.',
 '{"emailBriefing":{"selected":true,"brief":"Launch announcement to OEM accounts","reference":"","briefingDoc":"email-brief.pdf"},"landingPages":{"selected":true,"brief":"Drive demo sign-ups; primary CTA above the fold","reference":"henkel.com/lp","briefingDoc":"landing-brief.pdf"},"forms":{"selected":true,"brief":"Capture name, company, application & volume","reference":"","briefingDoc":"form-brief.pdf"},"trackingPixels":{"selected":true,"provider":"GA4","pixelId":"G-XXXX1234","events":"page_view, sign_up"},"localization":{"selected":true,"languages":["English (UK)","German"]}}',
 '[{"name":"L. Vogel","role":"Owner"},{"name":"APAC creative","role":""}]','ADH-2038','14 Jun 2026 · 09:12',null,null),

('Technomelt EMEA Push','Technomelt','Packaging','Germany','in_production',75,'2026-06-22','2026-07-03','Demand gen','High','German','CC-3140',
 '{"Germany","France","Poland"}','{"Email","SEM"}','Grow EMEA pipeline for hot-melt adhesives','Talk to an expert','M. Roth','','M. Sauer','',
 '{"emailBriefing":{"selected":true,"brief":"Demand-gen nurture for hot-melt adhesives","reference":"","briefingDoc":"emea-email-brief.pdf"},"landingPages":{"selected":true,"brief":"Pillar page with gated guide","reference":"","briefingDoc":"emea-lp-brief.pdf"},"forms":{"selected":true,"brief":"Capture contact + use case","reference":"","briefingDoc":"emea-form-brief.pdf"},"trackingPixels":{"selected":false,"provider":"","pixelId":"","events":""},"localization":{"selected":false,"languages":[]}}',
 '[]',null,null,'2026-06-19','2026-07-03'),

('Adhesive Selector Email','Loctite','Industrial','Germany','draft',30,'2026-06-24','2026-06-30','Newsletter','Low','','',
 '{}','{"Email"}','','','','','Jan Stoker','',
 '{"emailBriefing":{"selected":false,"brief":"","reference":"","briefingDoc":""},"landingPages":{"selected":false,"brief":"","reference":"","briefingDoc":""},"forms":{"selected":false,"brief":"","reference":"","briefingDoc":""},"trackingPixels":{"selected":false,"provider":"","pixelId":"","events":""},"localization":{"selected":false,"languages":[]}}',
 '[]',null,null,null,null),

('Teroson PU Sealant Teaser','Teroson','Automotive','Germany','draft',10,'2026-06-24','2026-06-29','Demand gen','Low','','',
 '{}','{}','','','','','Jan Stoker','',
 '{"emailBriefing":{"selected":false,"brief":"","reference":"","briefingDoc":""},"landingPages":{"selected":false,"brief":"","reference":"","briefingDoc":""},"forms":{"selected":false,"brief":"","reference":"","briefingDoc":""},"trackingPixels":{"selected":false,"provider":"","pixelId":"","events":""},"localization":{"selected":false,"languages":[]}}',
 '[]',null,null,null,null),

('Bonderite Reorder Flow','Bonderite','General Manufacturing','United States','draft',20,'2026-06-27','2026-07-04','Nurture','Medium','English (US)','',
 '{"United States"}','{"Email"}','','','','','Jan Stoker','',
 '{"emailBriefing":{"selected":false,"brief":"","reference":"","briefingDoc":""},"landingPages":{"selected":false,"brief":"","reference":"","briefingDoc":""},"forms":{"selected":false,"brief":"","reference":"","briefingDoc":""},"trackingPixels":{"selected":false,"provider":"","pixelId":"","events":""},"localization":{"selected":false,"languages":[]}}',
 '[]',null,null,null,null),

('Teroson Q3 Industrial Push','Teroson','Industrial','Germany','in_production',50,'2026-06-29','2026-07-08','Demand gen','High','German','CC-2240',
 '{"Germany","France"}','{"Email","LinkedIn"}','Build Q3 industrial pipeline','Download the guide','P. Adler','','Jan Stoker','',
 '{"emailBriefing":{"selected":true,"brief":"Q3 industrial push announcement","reference":"","briefingDoc":"q3-email-brief.pdf"},"landingPages":{"selected":false,"brief":"","reference":"","briefingDoc":""},"forms":{"selected":false,"brief":"","reference":"","briefingDoc":""},"trackingPixels":{"selected":false,"provider":"","pixelId":"","events":""},"localization":{"selected":false,"languages":[]}}',
 '[]',null,null,'2026-06-23','2026-07-08');

-- Tickets for the campaigns that start life in production (link by unique campaign name).
insert into public.devops_tickets (id, campaign_id, team, title, stage, sla, assignee, due_date)
select v.id, c.id, v.team, v.title, v.stage, v.sla, v.assignee, v.due_date
from (values
  ('ADH-2031-EMAIL','Loctite 243 Relaunch','CRM / Email','Email build & send','Ready for UAT','On track','S. Klein','02 Jul'),
  ('ADH-2031-WEB','Loctite 243 Relaunch','Web & Landing','Landing page + form + tracking','Briefed','Overdue','Unassigned','30 Jun'),
  ('ADH-2031-PAID','Loctite 243 Relaunch','Paid Media','Search & display campaigns','Live','On track','P. Adler','24 Jun'),
  ('ADH-2031-SOCIAL','Loctite 243 Relaunch','Social','Organic + paid social assets','In progress','On track','L. Vogel','01 Jul'),
  ('ADH-2034-EMAIL','Technomelt EMEA Push','CRM / Email','Email build & send','In progress','On track','S. Klein','03 Jul'),
  ('ADH-2034-PAID','Technomelt EMEA Push','Paid Media','Search & display campaigns','In progress','At risk','P. Adler','03 Jul'),
  ('ADH-2036-EMAIL','Teroson Q3 Industrial Push','CRM / Email','Email build & send','In progress','On track','S. Klein','08 Jul'),
  ('ADH-2036-SOCIAL','Teroson Q3 Industrial Push','Social','Organic + paid social assets','In progress','On track','L. Vogel','08 Jul')
) as v(id, campaign_name, team, title, stage, sla, assignee, due_date)
join public.campaigns c on c.name = v.campaign_name;
