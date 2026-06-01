'use client'

import { useRef, useState } from 'react'
import { clientApi } from '@/lib/api-client'
import { useMutation } from '@/hooks/use-mutation'
import { Input, FormField } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

interface Props { embedded?: boolean }

function FormContent() {
  const formRef = useRef<HTMLFormElement>(null)
  const [success, setSuccess] = useState(false)
  const { mutate, pending, error } = useMutation(
    (data: { currentPassword: string; newPassword: string }) =>
      clientApi.changePassword(data),
    {
      onSuccess: () => {
        setSuccess(true)
        formRef.current?.reset()
      },
    },
  )
  return (
    <form
      ref={formRef}
      onSubmit={(e) => {
        e.preventDefault()
        setSuccess(false)
        const fd = new FormData(e.currentTarget)
        mutate({
          currentPassword: fd.get('currentPassword') as string,
          newPassword:     fd.get('newPassword') as string,
        })
      }}
      className="flex flex-col gap-4"
    >
      {error && (
        <p className="text-sm text-danger bg-danger/10 border border-danger/20 px-3 py-2 rounded-lg">{error}</p>
      )}
      {success && (
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
  )
}

export function PasswordForm({ embedded }: Props) {
  if (embedded) {
    return (
      <div>
        <p className="text-sm font-medium text-slate-300 mb-4">Alterar senha</p>
        <FormContent />
      </div>
    )
  }
  return (
    <Card>
      <CardHeader><CardTitle>Segurança</CardTitle></CardHeader>
      <CardContent><FormContent /></CardContent>
    </Card>
  )
}
