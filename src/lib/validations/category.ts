import { z } from 'zod'

export const CategorySchema = z.object({
  name:  z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(50),
  icon:  z.string().min(1, 'Ícone obrigatório').max(10),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Cor inválida'),
})

export type CategoryInput = z.infer<typeof CategorySchema>
