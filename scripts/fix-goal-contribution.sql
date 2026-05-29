-- Create the missing EXPENSE transaction for the R$200 goal contribution
-- Find the default category first, then create the transaction
INSERT INTO "Transaction" (id, amount, type, description, date, "userId", "categoryId", "createdAt", "updatedAt")
SELECT
  gen_random_uuid(),
  200.00,
  'EXPENSE',
  'Aporte — Lancer',
  '2026-05-28 03:00:00',
  u.id,
  (SELECT id FROM "Category" WHERE "isDefault" = true LIMIT 1),
  NOW(),
  NOW()
FROM "User" u
WHERE u.email = 'rookmoneybrasil@gmail.com'
AND NOT EXISTS (
  SELECT 1 FROM "Transaction" t
  WHERE t."userId" = u.id
  AND t.description = 'Aporte — Lancer'
  AND t.type = 'EXPENSE'
  AND t.date::date = '2026-05-28'
);
