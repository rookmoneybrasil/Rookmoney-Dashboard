'use client'

import { useActionState } from 'react'
import { changePassword } from '@/app/actions/settings'
import { Input, FormField } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export function PasswordForm() {
  const [state, formAction, pending] = useActionState(changePassword, undefined)

  return (
    <Card>
      <CardHeader><CardTitle>Segurança</CardTitle></CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-4">
          {state?.error && (
            <p className="text-sm text-danger bg-danger/10 border border-danger/20 px-3 py-2 rounded-lg">
              {state.error}
            </p>
          )}
          {state?.success && (
            <p className="text-sm text-success bg-success/10 border border-success/20 px-3 py-2 rounded-lg">
              Senha alterada com sucesso!
            </p>
          )}

          <FormField label="Senha atual" htmlFor="currentPassword">
            <Input id="currentPassword" name="currentPassword" type="password" placeholder="••••••••" required />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Nova senha" htmlFor="newPassword">
              <Input id="newPassword" name="newPassword" type="password" placeholder="••••••••" required />
            </FormField>
            <FormField label="Confirmar nova senha" htmlFor="confirmPassword">
              <Input id="confirmPassword" name="confirmPassword" type="password" placeholder="••••••••" required />
            </FormField>
          </div>

          <div className="flex justify-end">
            <Button size="sm" variant="secondary" loading={pending}>Alterar senha</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
