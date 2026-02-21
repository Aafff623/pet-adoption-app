-- Add structured location fields to support province/city/detail
BEGIN;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS province TEXT DEFAULT '';

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS city_name TEXT DEFAULT '';

ALTER TABLE public.pets
  ADD COLUMN IF NOT EXISTS province TEXT DEFAULT '';

ALTER TABLE public.pets
  ADD COLUMN IF NOT EXISTS city_name TEXT DEFAULT '';

ALTER TABLE public.pets
  ADD COLUMN IF NOT EXISTS location_detail TEXT DEFAULT '';

ALTER TABLE public.lost_pet_alerts
  ADD COLUMN IF NOT EXISTS province TEXT DEFAULT NULL;

ALTER TABLE public.lost_pet_alerts
  ADD COLUMN IF NOT EXISTS city_name TEXT DEFAULT NULL;

ALTER TABLE public.lost_pet_alerts
  ADD COLUMN IF NOT EXISTS location_detail TEXT DEFAULT NULL;

-- Indexes to speed up location queries
CREATE INDEX IF NOT EXISTS idx_pets_province_city ON public.pets (province, city_name);
CREATE INDEX IF NOT EXISTS idx_profiles_province_city ON public.profiles (province, city_name);

COMMIT;
