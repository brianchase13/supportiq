'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Lock, Loader2, CheckCircle, XCircle } from 'lucide-react'

function ResetPasswordForm() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const code = searchParams.get('code')

  useEffect(() => {
    if (!code) {
      setMessage('Invalid reset link. Please request a new password reset.')
    }
  }, [code])

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!code) {
      setMessage('Invalid reset link. Please request a new password reset.')
      return
    }

    if (password !== confirmPassword) {
      setMessage('Passwords do not match.')
      return
    }

    if (password.length < 6) {
      setMessage('Password must be at least 6 characters long.')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) {
        setMessage(error.message)
      } else {
        setSuccess(true)
        setMessage('Password updated successfully! Redirecting to login...')
        setTimeout(() => {
          router.push('/auth')
        }, 2000)
      }
    } catch (error) {
      setMessage('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (!code) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <Card className="w-full max-w-md mx-auto bg-white border-gray-200 shadow-lg">
          <CardHeader className="text-center">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-2xl text-gray-900">Invalid Reset Link</CardTitle>
            <p className="text-gray-600">
              This password reset link is invalid or has expired.
            </p>
          </CardHeader>
          <CardContent className="text-center">
            <Button
              onClick={() => router.push('/auth')}
              className="w-full bg-black hover:bg-gray-800 text-white"
            >
              Back to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <Card className="w-full max-w-md mx-auto bg-white border-gray-200 shadow-lg">
        <CardHeader className="text-center">
          {success ? (
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          ) : (
            <Lock className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          )}
          <CardTitle className="text-2xl text-gray-900">
            {success ? 'Password Updated!' : 'Set New Password'}
          </CardTitle>
          <p className="text-gray-600">
            {success 
              ? 'Your password has been successfully updated.'
              : 'Enter your new password below.'
            }
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {!success && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    type="password"
                    placeholder="New password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 bg-white border-gray-300 text-gray-900"
                    required
                    minLength={6}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 bg-white border-gray-300 text-gray-900"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              {message && (
                <div className={`p-3 rounded-lg text-sm ${
                  success 
                    ? 'bg-green-50 text-green-700 border border-green-200' 
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {message}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-black hover:bg-gray-800 text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating password...
                  </>
                ) : (
                  'Update Password'
                )}
              </Button>
            </form>
          )}

          {success && (
            <div className="text-center">
              <div className="p-3 rounded-lg text-sm bg-green-50 text-green-700 border border-green-200 mb-4">
                {message}
              </div>
              <Button
                onClick={() => router.push('/auth')}
                className="w-full bg-black hover:bg-gray-800 text-white"
              >
                Go to Login
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <Card className="w-full max-w-md mx-auto bg-white border-gray-200 shadow-lg">
          <CardHeader className="text-center">
            <Loader2 className="w-12 h-12 text-gray-500 mx-auto mb-4 animate-spin" />
            <CardTitle className="text-2xl text-gray-900">Loading...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}