-- Demo the two new statuses in the calendar overview:
--   Bekron EMEA Push   — running now (22 Jun → 03 Jul) → live
--   Bekron Packaging Demo — ended 09 Jun and shut down → ended
update public.campaigns set status = 'live'  where name = 'Bekron EMEA Push';
update public.campaigns set status = 'ended' where name = 'Bekron Packaging Demo';
