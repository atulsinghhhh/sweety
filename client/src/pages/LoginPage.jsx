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
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-22">
        {errors.form && (
          <p role="alert" className="border-l-2 border-destructive pl-15 text-body text-destructive">
            {errors.form}
          </p>
        )}
        <FormField id="email" label="email" error={errors.email}>
          {(aria) => <Input {...aria} type="email" autoComplete="email" value={form.email} onChange={update('email')} />}
        </FormField>
        <FormField id="password" label="password" error={errors.password}>
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
        <Button type="submit" size="lg" disabled={submitting} className="w-full">
          {submitting ? 'Logging in…' : 'Log in'}
        </Button>
      </form>
      <p className="mt-22 text-body text-muted-foreground">
        New to Sweety? <Link to="/register">Create an account</Link>
      </p>
    </AuthLayout>
  )
}
