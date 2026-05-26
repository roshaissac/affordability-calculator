-- Rent vs Own lead capture table
-- Run via: supabase db push  OR  paste into Supabase SQL editor

CREATE TABLE IF NOT EXISTS rent_vs_own_leads (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at            timestamptz DEFAULT now(),
  first_name            text,
  last_name             text,
  email                 text NOT NULL,
  phone                 text,
  preferred_contact     text,         -- email | whatsapp | booking
  current_rent          numeric,
  neighbourhood         text,
  postal_code           text,
  bedrooms              int,
  property_type         text,         -- apartment | townhouse | detached
  months_renting        int,
  household_income      numeric,
  savings               numeric,
  monthly_debt          numeric,
  computed_max_price    numeric,
  computed_home_price   numeric,
  computed_5yr_rent_cost numeric,
  computed_5yr_equity   numeric,
  computed_5yr_wealth_gap numeric,
  computed_10yr_wealth_gap numeric,
  source                text DEFAULT 'rent_vs_own_door_knock',
  mode                  text,         -- advisor | client
  status                text DEFAULT 'new',
  consent_given         boolean DEFAULT false
);

ALTER TABLE rent_vs_own_leads ENABLE ROW LEVEL SECURITY;

-- Anonymous inserts only — no SELECT/UPDATE/DELETE for anon role
CREATE POLICY "Allow anonymous inserts" ON rent_vs_own_leads
  FOR INSERT TO anon
  WITH CHECK (true);
