-- The Pro Max row was already seeded by the earlier, unmigrated
-- scripts/setup-vip-system.sql before this feature's revenue-share decision
-- was finalized (85%/15% split, same as any normal sale — not a distinct
-- 30% rate). 20260630070000_vip_memberships.sql's corrected seed text only
-- applies on fresh insert, so the live row still had the old wording.
UPDATE "Membership"
SET beneficios = (
  SELECT jsonb_agg(
    CASE
      WHEN elem = 'Los instructores reciben el 30% del precio del curso'
        THEN 'Los instructores reciben su comisión normal por cada curso'
      ELSE elem
    END
  )
  FROM jsonb_array_elements_text(beneficios) AS elem
)
WHERE tipo = 'PRO_MAX'
  AND beneficios @> '["Los instructores reciben el 30% del precio del curso"]'::jsonb;
