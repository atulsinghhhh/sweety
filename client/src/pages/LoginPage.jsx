import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import AuthLayout from '@/components/AuthLayout'
import FormField from '@/components/FormField'
import { useAuth } from '@/hooks/useAuth'
import { getErrorField, getErrorMessage } from '@/lib/api'
import { validateLogin } from '@/lib/validation'

export default function LoginPage() {
  const { login } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const update = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }))
    setErrors((prev) => ({ ...prev, [field]: undefined, form: undefined }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const validationErrors = validateLogin(form)
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length) return

    setSubmitting(true)
    try {
      // PublicOnlyRoute redirects (back to the original page) once the user is set
      await login({ email: form.email.trim(), password: form.password })
    } catch (err) {
      const field = getErrorField(err)
      setErrors({ [field || 'form']: getErrorMessage(err) })
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout title="Log in" description="Welcome back. Enter your details to continue.">
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        {errors.form && (
          <p role="alert" className="rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-destructive">
            {errors.form}
          </p>
        )}
        <FormField id="email" label="Email" error={errors.email}>
          {(aria) => <Input {...aria} type="email" autoComplete="email" value={form.email} onChange={update('email')} />}
        </FormField>
        <FormField id="password" label="Password" error={errors.password}>
          {(aria) => (
            <Input
              {...aria}
              type="password"
              autoComplete="current-password"
              value={form.password}
              onChange={update('password')}
            />
          )}
        </FormField>
        <Button type="submit" size="lg" disabled={submitting} className="mt-2 w-full">
          {submitting ? 'Logging in…' : 'Log in'}
        </Button>
      </form>
      <p className="mt-8 text-muted-foreground">
        New to Sweety? <Link to="/register" className="font-semibold">Create an account</Link>
      </p>
    </AuthLayout>
  )
}
