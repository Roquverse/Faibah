'use client';

import React, { useState } from 'react';
import { Mail, Sparkles, User, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const sanitizedEmail = email.trim();
    
    setTimeout(() => {
      setIsLoading(false);
      setIsSent(true);
    }, 800);
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white">
      {/* Left section: Form (50%) */}
      <div className="w-full lg:w-1/2 flex flex-col p-6 sm:p-8 lg:p-12 xl:p-20 bg-white min-h-screen relative">
        <div className="mb-6 lg:mb-0 lg:absolute lg:top-12 lg:left-12 flex items-center justify-center lg:justify-start">
          <img src="/logo.png" alt="Faibah" className="w-[140px] lg:w-[180px]" />
        </div>

        <div className="flex-1 flex flex-col justify-center max-w-[420px] w-full mx-auto">
          {!isSent ? (
            <>
              <div className="text-center mb-6 lg:mb-10">
                <div className="w-12 h-12 lg:w-16 lg:h-16 bg-deep-green/10 rounded-full flex items-center justify-center mx-auto mb-4 lg:mb-6">
                  <Mail className="w-6 h-6 lg:w-8 lg:h-8 text-deep-green" />
                </div>
                <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-gray-900 mb-2 lg:mb-4">
                  Need help with your account?
                </h1>
                <p className="text-gray-500 text-xs lg:text-sm leading-relaxed px-2 lg:px-4">
                  Enter the email address associated with your account and we will send you a link to reset your password.
                </p>
              </div>

              <form onSubmit={handleReset} className="space-y-4 lg:space-y-6">
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

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-2.5 lg:py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-deep-green hover:bg-[#2a5a2e] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-deep-green transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-2 lg:mt-4"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    'Send Link'
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-4">
                Check your inbox
              </h1>
              <p className="text-gray-500 text-sm leading-relaxed mb-8">
                We have sent a password reset link to <br/>
                <span className="font-semibold text-gray-900">{email}</span>
              </p>
              
              <button 
                onClick={() => setIsSent(false)}
                className="text-sm font-semibold text-deep-green hover:text-primary transition-colors"
              >
                Didn't receive the email? Click to resend
              </button>
            </div>
          )}

          <div className="mt-8 lg:mt-12 text-center">
            <Link href="/login" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to log in
            </Link>
          </div>
        </div>
      </div>

      {/* Right section: Visual (50%) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#F8F9FA] items-center justify-center p-8">
        <div className="w-full h-full max-h-[800px] bg-white rounded-[2rem] border border-gray-100 overflow-hidden relative flex flex-col pt-16 px-12">
          
          <div className="flex-1 w-full relative z-10 mx-auto max-w-xl">
            <div className="bg-white rounded-xl border border-gray-100 w-full mb-10 overflow-hidden transform transition-transform duration-700 hover:scale-[1.02]">
              <div className="flex items-center gap-3 p-4 border-b border-gray-100 bg-gray-50/50">
                <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                  <User className="w-4 h-4 text-gray-400" />
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-800">Faiba Agency</div>
                  <div className="text-[10px] text-gray-500">Dashboard</div>
                </div>
              </div>
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
