import { z } from 'zod'

export const LoginSchema = z.object({
  email:    z.email('E-mail inválido'),
  password: z.string().min(1, 'Senha obrigatória'),
})

export const RegisterSchema = z.object({
  name:     z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').trim(),
  email:    z.email('E-mail inválido'),
  password: z.string()
    .min(8,   'Mínimo 8 caracteres')
    .regex(/[a-zA-Z]/,  'Precisa conter pelo menos uma letra')
    .regex(/[0-9]/,     'Precisa conter pelo menos um número')
    .regex(/[^a-zA-Z0-9]/, 'Precisa conter pelo menos um caractere especial (!@#$%...)'),
})

export type LoginInput    = z.infer<typeof LoginSchema>
export type RegisterInput = z.infer<typeof RegisterSchema>
