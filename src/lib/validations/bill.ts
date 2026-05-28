import { z } from 'zod'

export const BillSchema = z.object({
  name:         z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100),
  amount:       z.coerce.number().positive('Valor deve ser maior que zero'),
  dueDate:      z.string().min(1, 'Data de vencimento obrigatória'),
  isRecurring:  z.coerce.boolean().optional().default(false),
  notes:        z.string().max(500).optional(),
  categoryId:   z.string().optional(),
  installments: z.coerce.number().int().min(1).max(48).optional().default(1),
})

export type BillInput = z.infer<typeof BillSchema>
