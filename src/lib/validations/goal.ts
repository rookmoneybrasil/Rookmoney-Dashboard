import { z } from 'zod'

export const GoalSchema = z.object({
  name:          z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100),
  targetAmount:  z.coerce.number().positive('Valor alvo deve ser maior que zero'),
  currentAmount: z.coerce.number().min(0).optional().default(0),
  deadline:      z.string().optional(),
  description:   z.string().max(500).optional(),
  icon:          z.string().optional(),
  color:         z.string().optional(),
})

export const GoalContributionSchema = z.object({
  amount: z.coerce.number().positive('Valor deve ser maior que zero'),
})

export type GoalInput = z.infer<typeof GoalSchema>
