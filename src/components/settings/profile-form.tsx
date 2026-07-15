'use client'

import { useRef, useState } from 'react'
import { clientApi } from '@/lib/api-client'
import { Input, FormField } from '@/components/ui/input'
import { DateInput } from '@/components/ui/date-input'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { Camera, User, MapPin, Briefcase, Loader2 } from 'lucide-react'

const AVATAR_SIZE = 256

// Reads a File, center-crops it to a square and re-encodes as JPEG so
// uploads stay small regardless of the original photo's dimensions.
async function resizeImageFile(file: File, size = AVATAR_SIZE, quality = 0.85): Promise<Blob> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload  = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.onload  = () => resolve(image)
    image.onerror = () => reject(new Error('Não foi possível ler a imagem.'))
    image.src = dataUrl
  })
  const side = Math.min(img.width, img.height)
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas indisponível.')
  ctx.drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, size, size)
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(b => (b ? resolve(b) : reject(new Error('Falha ao processar a imagem.'))), 'image/jpeg', quality)
  })
}

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
  const originalProfileImage = profileImage ?? ''
  const [form, setForm] = useState({
    name:         name,
    profileImage: profileImage ?? '',
    bio:          bio ?? '',
    city:         city ?? '',
    occupation:   occupation ?? '',
    birthdate:    birthdate ? birthdate.split('T')[0] : '',
  })
  const [pending,   setPending]   = useState(false)
  const [uploading, setUploading] = useState(false)
  const [success,   setSuccess]   = useState(false)
  const [error,     setError]     = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  function set(key: string, val: string) {
    setForm(f => ({ ...f, [key]: val }))
    setSuccess(false)
    setError('')
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = '' // allow re-selecting the same file later
    if (!file) return
    if (!file.type.startsWith('image/')) { setError('Escolha um arquivo de imagem.'); return }
    if (file.size > 8 * 1024 * 1024) { setError('Imagem muito grande (máx. 8MB).'); return }

    setUploading(true)
    setError('')
    setSuccess(false)
    try {
      const resized = await resizeImageFile(file)
      const body = new FormData()
      body.append('file', resized, 'avatar.jpg')
      const res  = await fetch('/api/avatar-upload', { method: 'POST', body })
      const json = await res.json()
      if (!res.ok || !json.ok) throw new Error(json.error ?? 'Falha no upload.')
      set('profileImage', json.url)
    } catch {
      setError('Erro ao enviar a foto. Tente novamente.')
    } finally {
      setUploading(false)
    }
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
      if (originalProfileImage && originalProfileImage !== form.profileImage && originalProfileImage.includes('.blob.vercel-storage.com')) {
        fetch(`/api/avatar-upload?url=${encodeURIComponent(originalProfileImage)}`, { method: 'DELETE' }).catch(() => {})
      }
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
      {/* Avatar preview + upload */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="relative shrink-0 disabled:cursor-not-allowed"
        >
          <Avatar src={form.profileImage || undefined} name={form.name} size="xl" />
          <div className="absolute -bottom-1 -right-1 size-6 rounded-full bg-brand-600 border-2 border-ink-800 flex items-center justify-center">
            <Camera className="size-3 text-white" />
          </div>
          {uploading && (
            <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
              <Loader2 className="size-4 text-white animate-spin" />
            </div>
          )}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-300 mb-1">Foto de perfil</p>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            loading={uploading}
            onClick={() => fileInputRef.current?.click()}
          >
            {form.profileImage ? 'Trocar foto' : 'Escolher foto'}
          </Button>
          <p className="text-[11px] text-slate-600 mt-1">Escolha uma foto da galeria ou do computador. Login com Google preenche automaticamente.</p>
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
