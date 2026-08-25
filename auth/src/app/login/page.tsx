'use client';

import React, { useState } from 'react';
import { Mail, Lock, Sparkles, User, Check } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const sanitizedEmail = email.trim();

    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: sanitizedEmail,
      password,
    });

    setIsLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    const hasCompletedOnboarding = data.user?.user_metadata?.onboarding_completed;
    const userType = data.user?.user_metadata?.userType;

    if (hasCompletedOnboarding) {
      if (userType === 'client') {
        window.location.href = process.env.NEXT_PUBLIC_CLIENT_APP_URL || 'http://localhost:3002';
      } else {
        window.location.href = process.env.NEXT_PUBLIC_MAIN_APP_URL || 'http://localhost:3000';
      }
    } else {
      window.location.href = '/onboarding';
    }
  };

  const handleOAuthLogin = async (provider: 'google' | 'apple') => {
    try {
      setIsLoading(true);
      const supabase = createClient();
      const redirectTo = `${window.location.origin}/auth/callback`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        alert(error.message);
        setIsLoading(false);
      }
    } catch (e: any) {
      alert(e.message || 'Failed to initiate social login.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white">
      {/* Left section: Form (50%) */}
      <div className="w-full lg:w-1/2 flex flex-col p-6 sm:p-8 lg:p-12 xl:p-20 bg-white min-h-screen relative">
        <div className="mb-6 lg:mb-0 lg:absolute lg:top-12 lg:left-12 flex items-center justify-center lg:justify-start">
          <img src="/logo.png" alt="Faibah" className="w-[140px] lg:w-[180px]" />
        </div>

        <div className="flex-1 flex flex-col justify-center max-w-[420px] w-full mx-auto">
          <div className="text-center mb-6 lg:mb-10">
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-gray-900 mb-1 lg:mb-2">
              Sign in to Faibah
            </h1>
            <p className="text-gray-500 text-xs lg:text-sm">
              One solution for all your Project & Invoicing solution
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 lg:space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700" htmlFor="email">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-4 py-2.5 lg:py-3 bg-white border border-gray-200 rounded-xl text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-deep-green focus:border-transparent transition-all text-sm lg:text-base"
                  placeholder="name@company.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-11 py-2.5 lg:py-3 bg-white border border-gray-200 rounded-xl text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-deep-green focus:border-transparent transition-all text-sm lg:text-base"
                  placeholder="••••••••"
                  required
                />
                <button type="button" className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 pb-1 lg:pt-2 lg:pb-2">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className={`w-4 h-4 rounded-[4px] border flex items-center justify-center transition-colors ${rememberMe ? 'bg-deep-green border-deep-green' : 'border-gray-300 group-hover:border-deep-green'}`}>
                  {rememberMe && <Check className="w-3 h-3 text-white" />}
                </div>
                <input
                  type="checkbox"
                  className="hidden"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span className="text-xs lg:text-sm text-gray-600 font-medium">Remember me</span>
              </label>
              <Link href="/forgot-password" className="text-xs lg:text-sm font-semibold text-deep-green hover:underline">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2.5 lg:py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-deep-green hover:bg-[#2a5a2e] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-deep-green transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Sign In'
              )}
            </button>

            <div className="relative my-6 lg:my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100" />
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-wider">
                <span className="px-4 bg-white text-gray-400 font-semibold">Or continue with</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 lg:gap-3">
              <button
                type="button"
                onClick={() => handleOAuthLogin('google')}
                disabled={isLoading}
                className="w-full sm:flex-1 flex items-center justify-center gap-2.5 py-2.5 border border-gray-200 rounded-xl bg-white text-[13px] lg:text-[13.5px] font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 focus:outline-none transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Google
              </button>

              <button
                type="button"
                onClick={() => handleOAuthLogin('apple')}
                disabled={isLoading}
                className="w-full sm:flex-1 flex items-center justify-center gap-2.5 py-2.5 border border-black rounded-xl bg-black text-[13px] lg:text-[13.5px] font-semibold text-white hover:bg-gray-800 focus:outline-none transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current text-white">
                  <path d="M16.365 14.736c-.035-3.23 2.656-4.793 2.778-4.873-1.493-2.193-3.805-2.493-4.636-2.528-1.97-.2-3.847 1.163-4.85 1.163-1.002 0-2.55-1.127-4.168-1.096-2.09.03-4.015 1.218-5.088 3.08-2.18 3.784-.555 9.387 1.558 12.44 1.042 1.5 2.277 3.178 3.905 3.12 1.562-.06 2.155-.99 4.043-.99 1.886 0 2.42.99 4.045.96 1.683-.03 2.748-1.503 3.78-3.007 1.194-1.745 1.685-3.435 1.71-3.522-.04-.015-3.18-1.22-3.21-4.783h.133z" />
                  <path d="M14.938 5.753c.857-1.04 1.436-2.484 1.278-3.923-1.24.05-2.735.827-3.62 1.865-.79.882-1.484 2.355-1.298 3.77 1.385.108 2.78-.66 3.64-1.712z" />
                </svg>
                Apple
              </button>
            </div>

            <p className="text-sm text-center text-gray-600 mt-6 lg:mt-8 pt-2 lg:pt-4">
              Don't have an account?{' '}
              <Link href="/signup" className="font-bold text-gray-900 hover:text-deep-green transition-colors">
                Sign Up
              </Link>
            </p>
          </form>
        </div>
      </div>

      {/* Right section: Visual (50%) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#F8F9FA] items-center justify-center p-8">
        <div className="w-full h-full max-h-[800px] bg-white rounded-[2rem] border border-gray-100 overflow-hidden relative flex flex-col pt-16 px-12">

          {/* Main Mock Dashboard Container */}
          <div className="flex-1 w-full relative z-10 mx-auto max-w-xl">
            <div className="bg-white rounded-xl border border-gray-100 w-full mb-10 overflow-hidden transform transition-transform duration-700 hover:scale-[1.02]">
              {/* Fake dashboard header */}
              <div className="flex items-center gap-3 p-4 border-b border-gray-100 bg-gray-50/50">
                <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                  <User className="w-4 h-4 text-gray-400" />
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-800">Faiba Agency</div>
                  <div className="text-[10px] text-gray-500">Dashboard</div>
                </div>
              </div>
              {/* Fake dashboard body */}
              <div className="p-6">
                <div className="flex gap-4 mb-6">
                  <div className="flex-1 bg-gray-50 rounded-lg p-4">
                    <div className="text-[10px] text-gray-500 font-semibold uppercase">Total Clients</div>
                    <div className="text-2xl font-bold text-gray-900 mt-1">162</div>
                    <div className="text-xs text-green-500 mt-2 font-medium">+12% this month</div>
                  </div>
                  <div className="flex-1 bg-gray-50 rounded-lg p-4">
                    <div className="text-[10px] text-gray-500 font-semibold uppercase">Revenue</div>
                    <div className="text-2xl font-bold text-gray-900 mt-1">$23,569</div>
                    <div className="text-xs text-green-500 mt-2 font-medium">+8% from last period</div>
                  </div>
                  <div className="flex-1 bg-gray-50 rounded-lg p-4">
                    <div className="text-[10px] text-gray-500 font-semibold uppercase">Tasks</div>
                    <div className="text-2xl font-bold text-gray-900 mt-1">45</div>
                    <div className="text-xs text-gray-500 mt-2 font-medium">12 pending</div>
                  </div>
                </div>

                <div className="h-40 w-full bg-gradient-to-t from-deep-green/10 to-transparent rounded-lg flex items-end mb-4 border border-gray-100">
                  <svg className="w-full h-full text-deep-green stroke-current p-2" viewBox="0 0 100 30" fill="none" preserveAspectRatio="none">
                    <path d="M0,25 Q10,10 20,15 T40,10 T60,20 T80,5 T100,15" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                    <path d="M0,28 Q10,15 20,20 T40,15 T60,25 T80,10 T100,20" strokeWidth="1" strokeOpacity="0.5" vectorEffect="non-scaling-stroke" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Text Content Below */}
            <div className="text-left max-w-md">
              <h2 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
                Manage projects, tasks, and invoices in one place
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed">
                Faibah brings your entire workflow into one simple workspace — so you always know what has been done, what you've billed, and what you're still owed.
              </p>
              <div className="flex items-center gap-2 mt-8">
                <div className="w-8 h-1.5 rounded-full bg-deep-green" />
                <div className="w-2 h-2 rounded-full bg-gray-300" />
                <div className="w-2 h-2 rounded-full bg-gray-300" />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
