import { z } from 'zod'

export const PersonSchema = z.object({
  name:  z.string().min(1, 'Nome obrigatório').max(100),
  notes: z.string().max(500).optional(),
  color: z.string().optional(),
})

export const PersonEntrySchema = z.object({
  type:         z.enum(['THEY_OWE_ME', 'I_OWE_THEM']),
  description:  z.string().min(1, 'Descrição obrigatória').max(200),
  amount:       z.coerce.number().positive('Valor deve ser maior que zero'),
  date:         z.string().min(1, 'Data obrigatória'),
  notes:        z.string().max(500).optional(),
  installments: z.coerce.number().int().min(1).max(60).default(1),
  categoryId:   z.string().optional(),
})

export type PersonInput      = z.infer<typeof PersonSchema>
export type PersonEntryInput = z.infer<typeof PersonEntrySchema>
