UPDATE "IncomeSource" SET "lastAutoPayMonth" = NULL WHERE amount = 6500 AND "dayOfMonth" = 1;
SELECT name, amount, "lastAutoPayMonth" FROM "IncomeSource";
