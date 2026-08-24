'use client';

import React, { useState, useRef, Suspense } from 'react';
import { Mail, Sparkles, User, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

function VerifyEmailForm() {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get('email') || '';

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const supabase = createClient();
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: code.join(''),
      type: 'signup'
    });
    
    setIsLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    // Redirect to onboarding
    window.location.href = '/onboarding';
  };

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return; // Prevent multiple chars
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white">
      {/* Left section: Form (50%) */}
      <div className="w-full lg:w-1/2 flex flex-col p-8 sm:p-12 xl:p-20 bg-white min-h-screen relative">
        <div className="absolute top-8 left-8 sm:top-12 sm:left-12 flex items-center gap-2">
          <img src="/logo.png" alt="" width={200} />
        </div>

        <div className="flex-1 flex flex-col justify-center max-w-[420px] w-full mx-auto">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-deep-green/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="w-8 h-8 text-deep-green" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-4">
              Verify your email
            </h1>
            <p className="text-gray-500 text-sm leading-relaxed px-4">
              We have sent a code to your email <br/>
              <span className="font-semibold text-gray-900">{email || 'your email'}</span>
            </p>
          </div>

          <form onSubmit={handleVerify} className="space-y-8">
            <div className="flex justify-center gap-3 sm:gap-4">
              {code.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => { inputRefs.current[idx] = el; }}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  className="w-12 h-14 sm:w-14 sm:h-16 text-center text-xl font-bold text-gray-900 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-deep-green focus:border-transparent transition-all"
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={isLoading || code.some(d => !d)}
              className="w-full flex justify-center py-3.5 px-4 rounded-xl text-sm font-bold text-white bg-deep-green hover:bg-[#2a5a2e] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-deep-green transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Verify Account'
              )}
            </button>
            
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-600">
                Resend code in 59:00
              </p>
            </div>
          </form>

          <div className="mt-12 text-center">
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

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-white"><div className="w-8 h-8 border-4 border-deep-green border-t-transparent rounded-full animate-spin" /></div>}>
      <VerifyEmailForm />
    </Suspense>
  );
}
