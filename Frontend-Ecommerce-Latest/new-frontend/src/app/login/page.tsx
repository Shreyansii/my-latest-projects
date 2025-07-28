'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '../../api/axios'
import Cookies from 'js-cookie'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { z } from 'zod'

interface TokenResponse {
  access: string
  refresh: string
  role: 'admin' | 'customer'
}

interface RegisterForm {
  username: string
  email: string
  password: string
  confirmPassword?: string
}

const loginSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

const signupSchema = z
  .object({
    username: z.string().min(3, 'Username must be at least 3 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Confirm Password must be at least 6 characters'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export default function AuthPage() {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [form, setForm] = useState<RegisterForm>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const toggleForm = () => {
    setIsLogin(!isLogin)
    setForm({ username: '', email: '', password: '', confirmPassword: '' })
    setError(null)
    setValidationErrors([])
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setValidationErrors([])

    const schema = isLogin ? loginSchema : signupSchema
    const result = schema.safeParse(form)

    if (!result.success) {
      const errs = result.error.issues.map((e) => e.message)
      setValidationErrors(errs)
      setLoading(false)
      return
    }

    try {
      if (isLogin) {
        const res = await api.post<TokenResponse>('/token/', {
          username: form.username,
          password: form.password,
        })

        const { access, refresh, role } = res.data
        Cookies.set('access_token', access, { path: '/' })
        Cookies.set('refresh_token', refresh, { path: '/' })

        router.push(role === 'admin' ? '/dashboard/admin' : '/dashboard/customer')
      } else {
        await api.post('/register/', {
          username: form.username,
          email: form.email,
          password: form.password,
        })

        const loginRes = await api.post<TokenResponse>('/token/', {
          username: form.username,
          password: form.password,
        })

        const { access, refresh, role } = loginRes.data
        Cookies.set('access_token', access, { path: '/' })
        Cookies.set('refresh_token', refresh, { path: '/' })

        router.push(role === 'admin' ? '/dashboard/admin' : '/dashboard/customer')
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-green-100 px-4"> {/* ✅ Mint green background */}
      <Card className="w-full max-w-md shadow-2xl">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle className="text-2xl text-center"> 
              {isLogin ? 'Login' : 'Sign Up'}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {validationErrors.length > 0 && (
              <Alert variant="destructive">
                <AlertTitle>Validation Error</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc list-inside">
                    {validationErrors.map((msg, i) => (
                      <li key={i}>{msg}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Input
              type="text"
              name="username"
              placeholder="Username"
              value={form.username}
              onChange={handleChange}
              required
            />

            {!isLogin && (
              <Input
                type="email"
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                required
              />
            )}

            <Input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
            />

            {!isLogin && (
              <Input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={form.confirmPassword}
                onChange={handleChange}
                required
              />
            )}
          </CardContent>

          <CardFooter className="flex flex-col gap-4 pt-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (isLogin ? 'Logging in...' : 'Signing up...') : isLogin ? 'Login' : 'Sign Up'}
            </Button>

            <p className="text-sm text-center">
              {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
              <Button variant="link" type="button" onClick={toggleForm} className="px-1 h-auto">
                {isLogin ? 'Sign up here' : 'Login here'}
              </Button>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
