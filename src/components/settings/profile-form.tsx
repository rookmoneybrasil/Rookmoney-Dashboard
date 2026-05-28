'use client'

import { useState } from 'react'
import { clientApi } from '@/lib/api-client'
import { useMutation } from '@/hooks/use-mutation'
import { Avatar } from '@/components/ui/avatar'
import { Input, FormField } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

interface Props { name: string; email: string }

export function ProfileForm({ name, email }: Props) {
  const [success, setSuccess] = useState(false)
  const { mutate, pending, error } = useMutation(
    (data: { name: string }) => clientApi.updateProfile(data),
    { onSuccess: () => setSuccess(true) },
  )

  return (
    <Card>
      <CardHeader><CardTitle>Perfil</CardTitle></CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            setSuccess(false)
            const fd = new FormData(e.currentTarget)
            mutate({ name: fd.get('name') as string })
          }}
          className="flex flex-col gap-4"
        >
          {error && (
            <p className="text-sm text-danger bg-danger/10 border border-danger/20 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}
          {success && (
            <p className="text-sm text-success bg-success/10 border border-success/20 px-3 py-2 rounded-lg">
              Perfil atualizado com sucesso!
            </p>
          )}

          <div className="flex items-center gap-4">
            <Avatar name={name} size="lg" />
            <div>
              <p className="text-sm font-medium text-slate-200">{name}</p>
              <p className="text-xs text-slate-500 mt-0.5">{email}</p>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Nome" htmlFor="name">
              <Input id="name" name="name" type="text" defaultValue={name} required />
            </FormField>
            <FormField label="E-mail" htmlFor="email">
              <Input id="email" name="email" type="email" defaultValue={email} required />
            </FormField>
          </div>

          <div className="flex justify-end">
            <Button size="sm" loading={pending}>Salvar alterações</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
