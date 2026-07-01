-- Add onboarding tracking fields to User table
ALTER TABLE "User" 
  ADD COLUMN IF NOT EXISTS "onboardingDone" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "username" TEXT,
  ADD COLUMN IF NOT EXISTS "propositoUso" TEXT,
  ADD COLUMN IF NOT EXISTS "comoNosConocio" TEXT,
  ADD COLUMN IF NOT EXISTS "avatarUrl" TEXT;
