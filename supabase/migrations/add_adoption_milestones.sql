-- Phase 3: 可信领养流程里程碑

CREATE TABLE IF NOT EXISTS public.adoption_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.adoption_applications(id) ON DELETE CASCADE,
  pet_id TEXT NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  adopter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stage TEXT NOT NULL CHECK (stage IN ('chatting', 'meet', 'trial', 'adopted')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed')),
  confirmed_by_adopter BOOLEAN NOT NULL DEFAULT FALSE,
  confirmed_by_owner BOOLEAN NOT NULL DEFAULT FALSE,
  note TEXT,
  confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (application_id, stage)
);

CREATE INDEX IF NOT EXISTS idx_adoption_milestones_application
  ON public.adoption_milestones (application_id, created_at);

CREATE INDEX IF NOT EXISTS idx_adoption_milestones_participants
  ON public.adoption_milestones (adopter_id, owner_id);

ALTER TABLE public.adoption_milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can read milestones"
  ON public.adoption_milestones FOR SELECT
  USING (auth.uid() = adopter_id OR auth.uid() = owner_id);

CREATE POLICY "Participants can insert milestones"
  ON public.adoption_milestones FOR INSERT
  WITH CHECK (auth.uid() = adopter_id OR auth.uid() = owner_id);

CREATE POLICY "Participants can update milestones"
  ON public.adoption_milestones FOR UPDATE
  USING (auth.uid() = adopter_id OR auth.uid() = owner_id)
  WITH CHECK (auth.uid() = adopter_id OR auth.uid() = owner_id);
