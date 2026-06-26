-- Demo the new brand scope: the owner only works on Next Henkel Adhesives + Fester
-- (the brands of their ACA campaigns), so their Brand filter narrows accordingly without
-- hiding anything. Region scope is left empty (filter falls back to their visible regions).
update public.profiles
  set brands = '{Next Henkel Adhesives,Fester}'
  where email = 'owner@demo.henkel';
