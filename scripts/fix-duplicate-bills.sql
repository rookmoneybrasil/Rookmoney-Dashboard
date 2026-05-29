-- Remove duplicate Claro Celular bills for June 2026, keeping only one
DELETE FROM "Bill"
WHERE name = 'Claro Celular'
  AND "isPaid" = false
  AND "dueDate" >= '2026-06-01'
  AND "dueDate" <= '2026-06-30'
  AND id NOT IN (
    SELECT id FROM "Bill"
    WHERE name = 'Claro Celular'
      AND "isPaid" = false
      AND "dueDate" >= '2026-06-01'
      AND "dueDate" <= '2026-06-30'
    ORDER BY "createdAt" ASC
    LIMIT 1
  );

SELECT name, "dueDate", "isPaid" FROM "Bill" WHERE name = 'Claro Celular' ORDER BY "dueDate";
