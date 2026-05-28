import { z } from 'zod'

export const TransactionSchema = z.object({
  amount:      z.coerce.number().positive('Valor deve ser maior que zero'),
  type:        z.enum(['INCOME', 'EXPENSE']),
  description: z.string().max(200).optional(),
  date:        z.string().min(1, 'Data obrigatória'),
  categoryId:  z.string().min(1, 'Categoria obrigatória'),
})

export type TransactionInput = z.infer<typeof TransactionSchema>
