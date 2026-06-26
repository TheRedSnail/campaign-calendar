-- Two more lifecycle states for the calendar overview:
--   live  — the campaign has launched and is currently running
--   ended — the campaign's end date has passed and it has been shut down
-- (ADD VALUE must be committed before the value can be used; the re-seed lives in the next migration.)
alter type campaign_status add value if not exists 'live';
alter type campaign_status add value if not exists 'ended';
