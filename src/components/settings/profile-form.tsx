'use client'

import { useState } from 'react'
import { clientApi } from '@/lib/api-client'
import { Input, FormField } from '@/components/ui/input'
import { DateInput } from '@/components/ui/date-input'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { Camera, User, MapPin, Briefcase } from 'lucide-react'

interface Props {
  name:         string
  email:        string
  profileImage?: string | null
  bio?:         string | null
  city?:        string | null
  occupation?:  string | null
  birthdate?:   string | null
}

export function ProfileForm({ name, email, profileImage, bio, city, occupation, birthdate }: Props) {
  const [form, setForm] = useState({
    name:         name,
    profileImage: profileImage ?? '',
    bio:          bio ?? '',
    city:         city ?? '',
    occupation:   occupation ?? '',
    birthdate:    birthdate ? birthdate.split('T')[0] : '',
  })
  const [pending, setPending] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error,   setError]   = useState('')

  function set(key: string, val: string) {
    setForm(f => ({ ...f, [key]: val }))
    setSuccess(false)
    setError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) { setError('Nome é obrigatório.'); return }
    setPending(true)
    try {
      await clientApi.updateProfile({
        name:         form.name.trim(),
        profileImage: form.profileImage.trim() || null,
        bio:          form.bio.trim() || null,
        city:         form.city.trim() || null,
        occupation:   form.occupation.trim() || null,
        birthdate:    form.birthdate || null,
      })
      setSuccess(true)
      setTimeout(() => window.location.reload(), 800)
    } catch {
      setError('Erro ao salvar. Tente novamente.')
    } finally {
      setPending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Avatar preview + URL field */}
      <div className="flex items-center gap-4">
        <div className="relative shrink-0">
          <Avatar src={form.profileImage || undefined} name={form.name} size="xl" />
          <div className="absolute -bottom-1 -right-1 size-6 rounded-full bg-brand-600 border-2 border-ink-800 flex items-center justify-center">
            <Camera className="size-3 text-white" />
          </div>
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-300 mb-1">Foto de perfil</p>
          <input
            type="url"
            value={form.profileImage}
            onChange={e => set('profileImage', e.target.value)}
            placeholder="https://... (URL da sua foto)"
            className="w-full bg-ink-700 border border-white/8 rounded-lg px-3 py-2 text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-brand-500/50"
          />
          <p className="text-[11px] text-slate-600 mt-1">Cole a URL de uma foto. Login com Google preenche automaticamente.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Nome completo" htmlFor="name" required>
          <Input id="name" value={form.name} onChange={e => set('name', e.target.value)}
            leftIcon={<User className="size-4" />} placeholder="Seu nome" required />
        </FormField>

        <FormField label="E-mail" htmlFor="email">
          <Input id="email" value={email} disabled type="email"
            className="opacity-50 cursor-not-allowed" />
        </FormField>

        <FormField label="Cidade" htmlFor="city">
          <Input id="city" value={form.city} onChange={e => set('city', e.target.value)}
            leftIcon={<MapPin className="size-4" />} placeholder="Ex: São Paulo, SP" />
        </FormField>

        <FormField label="Profissão / Ocupação" htmlFor="occupation">
          <Input id="occupation" value={form.occupation} onChange={e => set('occupation', e.target.value)}
            leftIcon={<Briefcase className="size-4" />} placeholder="Ex: Designer freelancer" />
        </FormField>

        <FormField label="Data de nascimento" htmlFor="birthdate">
          <DateInput id="birthdate" value={form.birthdate}
            onValueChange={v => set('birthdate', v)} />
        </FormField>
      </div>

      <FormField label="Bio" htmlFor="bio">
        <textarea
          id="bio"
          value={form.bio}
          onChange={e => set('bio', e.target.value)}
          rows={2}
          maxLength={160}
          placeholder="Uma frase sobre você (máx. 160 caracteres)"
          className="w-full bg-ink-700 border border-white/8 rounded-xl px-4 py-3 text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-brand-500/50 resize-none"
        />
        <p className="text-[11px] text-slate-600 mt-1 text-right">{form.bio.length}/160</p>
      </FormField>

      {error   && <p className="text-sm text-danger">{error}</p>}
      {success && <p className="text-sm text-success">✓ Perfil atualizado!</p>}

      <Button type="submit" loading={pending} className="self-start">
        Salvar perfil
      </Button>
    </form>
  )
}
