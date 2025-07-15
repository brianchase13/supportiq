'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, Lock, Loader2, ArrowRight } from 'lucide-react'

interface AuthButtonProps {
  redirectTo?: string
}

export function AuthButton({ redirectTo = '/dashboard' }: AuthButtonProps) {
  const [isSignUp, setIsSignUp] = useState(true)
  const [isForgotPassword, setIsForgotPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const supabase = createClient()
      
      if (isForgotPassword) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/reset-password`
        })
        
        if (error) {
          setMessage(error.message)
        } else {
          setMessage('Check your email for the password reset link!')
        }
        return
      }
      
      const { error } = isSignUp
        ? await supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: `${window.location.origin}/auth/callback?redirectTo=${redirectTo}`
            }
          })
        : await supabase.auth.signInWithPassword({
            email,
            password
          })

      if (error) {
        setMessage(error.message)
      } else {
        if (isSignUp) {
          setMessage('Check your email for the confirmation link!')
        } else {
          window.location.href = redirectTo
        }
      }
    } catch (error) {
      setMessage('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto bg-white border-gray-200 shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl text-gray-900">
          {isForgotPassword 
            ? 'Reset Password' 
            : isSignUp 
              ? 'Start Your Free Trial' 
              : 'Welcome Back'
          }
        </CardTitle>
        <p className="text-gray-600">
          {isForgotPassword
            ? 'Enter your email to receive a password reset link'
            : isSignUp 
              ? 'Join thousands saving money on support tickets' 
              : 'Sign in to your SupportIQ account'
          }
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleAuth} className="space-y-4">
          <div className="space-y-2">
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 bg-white border-gray-300 text-gray-900"
                required
              />
            </div>
          </div>
          
          {!isForgotPassword && (
            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-white border-gray-300 text-gray-900"
                  required
                />
              </div>
            </div>
          )}

          {message && (
            <div className={`p-3 rounded-lg text-sm ${
              message.includes('Check your email') 
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
                {isForgotPassword 
                  ? 'Sending reset link...' 
                  : isSignUp 
                    ? 'Creating account...' 
                    : 'Signing in...'
                }
              </>
            ) : (
              <>
                {isForgotPassword 
                  ? 'Send Reset Link' 
                  : isSignUp 
                    ? 'Start Free Trial' 
                    : 'Sign In'
                }
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </form>

        <div className="text-center space-y-2">
          {!isForgotPassword && (
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-gray-600 hover:text-black transition-colors block"
            >
              {isSignUp 
                ? 'Already have an account? Sign in' 
                : "Don't have an account? Start free trial"
              }
            </button>
          )}
          
          {!isSignUp && !isForgotPassword && (
            <button
              type="button"
              onClick={() => setIsForgotPassword(true)}
              className="text-sm text-gray-600 hover:text-black transition-colors block"
            >
              Forgot your password?
            </button>
          )}
          
          {isForgotPassword && (
            <button
              type="button"
              onClick={() => setIsForgotPassword(false)}
              className="text-sm text-gray-600 hover:text-black transition-colors block"
            >
              Back to sign in
            </button>
          )}
        </div>

        <div className="text-center text-xs text-gray-500">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </div>
      </CardContent>
    </Card>
  )
}