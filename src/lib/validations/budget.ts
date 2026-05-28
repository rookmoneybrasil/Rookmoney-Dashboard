import { z } from 'zod'

export const BudgetSchema = z.object({
  categoryId: z.string().min(1, 'Categoria obrigatória'),
  amount:     z.coerce.number().positive('Valor deve ser maior que zero'),
  month:      z.string().regex(/^\d{4}-\d{2}$/, 'Mês inválido'),
})

export type BudgetInput = z.infer<typeof BudgetSchema>
