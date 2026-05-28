import { z } from 'zod'

export const UpdateProfileSchema = z.object({
  name:  z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100),
  email: z.string().email('E-mail inválido'),
})

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Senha atual obrigatória'),
  newPassword:     z.string().min(8, 'Nova senha deve ter pelo menos 8 caracteres')
    .regex(/[a-zA-Z]/, 'Deve conter ao menos uma letra')
    .regex(/[0-9]/, 'Deve conter ao menos um número'),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: 'Senhas não coincidem',
  path: ['confirmPassword'],
})

export type UpdateProfileInput  = z.infer<typeof UpdateProfileSchema>
export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>
