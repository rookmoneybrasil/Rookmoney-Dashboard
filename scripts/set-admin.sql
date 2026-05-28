-- Lista usuários
SELECT id, name, email, "isAdmin", plan, "createdAt" FROM "User" ORDER BY "createdAt" ASC;

-- Marca TODOS os usuários como admin (para desenvolvimento)
UPDATE "User" SET "isAdmin" = true;
