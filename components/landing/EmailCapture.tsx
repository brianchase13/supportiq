'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Loader2, Users, Mail } from 'lucide-react';

export function EmailCapture() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [signupCount, setSignupCount] = useState(47); // Starting count

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/early-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setIsSubmitted(true);
        setSignupCount(prev => prev + 1);
        // Send welcome email
        await fetch('/api/send-welcome', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        });
      } else {
        const data = await response.json();
        setError(data.error || 'Something went wrong');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <Card className="bg-green-900/20 border-green-500/20 max-w-md mx-auto">
        <CardContent className="p-6 text-center">
          <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Welcome aboard! 🎉</h3>
          <p className="text-slate-300 mb-4">
            Check your email for your SupportIQ access link.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-slate-400">
            <Users className="w-4 h-4" />
            <span>Join {signupCount} support teams already using SupportIQ</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-white mb-2">Get Your Free Analysis</h3>
        <p className="text-slate-400">
          Enter your email and we'll send you a personalized support cost report
        </p>
        <div className="flex items-center justify-center gap-2 mt-2 text-sm text-green-400">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span>{signupCount} teams already got their reports</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-400 focus:border-blue-500"
            required
          />
        </div>

        {error && (
          <div className="text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <Button 
          type="submit" 
          disabled={isSubmitting || !email}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Joining...
            </>
          ) : (
            <>
              <Mail className="w-4 h-4 mr-2" />
              Get Early Access
            </>
          )}
        </Button>
      </form>

      <div className="text-xs text-slate-500 text-center mt-4">
        We'll send you your dashboard access link and notify you of updates.
        <br />
        No spam, unsubscribe anytime.
      </div>
    </div>
  );
}