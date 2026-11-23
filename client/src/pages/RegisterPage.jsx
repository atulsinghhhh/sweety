import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import AuthLayout from '@/components/AuthLayout'
import FormField from '@/components/FormField'
import { useAuth } from '@/hooks/useAuth'
import { getErrorField, getErrorMessage } from '@/lib/api'
import { validateRegister } from '@/lib/validation'

export default function RegisterPage() {
  const { register } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const update = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }))
    setErrors((prev) => ({ ...prev, [field]: undefined, form: undefined }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const validationErrors = validateRegister(form)
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length) return

    setSubmitting(true)
    try {
      await register({ name: form.name.trim(), email: form.email.trim(), password: form.password })
      toast.success('Account created. Welcome to Sweety.')
    } catch (err) {
      const field = getErrorField(err)
      setErrors({ [field || 'form']: getErrorMessage(err) })
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout title="Create account" description="Start tracking your blood glucose in under a minute.">
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-22">
        {errors.form && (
          <p role="alert" className="border-l-2 border-destructive pl-15 text-body text-destructive">
            {errors.form}
          </p>
        )}
        <FormField id="name" label="name" error={errors.name}>
          {(aria) => <Input {...aria} autoComplete="name" value={form.name} onChange={update('name')} />}
        </FormField>
        <FormField id="email" label="email" error={errors.email}>
          {(aria) => <Input {...aria} type="email" autoComplete="email" value={form.email} onChange={update('email')} />}
        </FormField>
        <FormField id="password" label="password" error={errors.password} hint="At least 8 characters.">
          {(aria) => (
            <Input
              {...aria}
              type="password"
              autoComplete="new-password"
              value={form.password}
              onChange={update('password')}
            />
          )}
        </FormField>
        <Button type="submit" size="lg" disabled={submitting} className="w-full">
          {submitting ? 'Creating account…' : 'Register'}
        </Button>
      </form>
      <p className="mt-22 text-body text-muted-foreground">
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </AuthLayout>
  )
}
