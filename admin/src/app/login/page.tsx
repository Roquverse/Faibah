'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Shield } from 'lucide-react';

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // We will verify SUPER_ADMIN via an API call in the layout, but let's push to overview first.
    router.push('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm border border-hairline bg-surface p-8">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-accent flex items-center justify-center rounded-sm">
            <Shield className="text-white w-4 h-4" strokeWidth={2.5} />
          </div>
          <span className="font-sans font-bold text-lg tracking-tight text-foreground">
            Faibah Admin
          </span>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="bg-danger/10 border border-danger/20 text-danger text-sm px-3 py-2">
              {error}
            </div>
          )}
          
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted uppercase tracking-wider block">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-background border border-hairline px-3 py-2 text-sm text-foreground focus:outline-none focus:border-accent transition-colors"
              required
            />
          </div>
          
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted uppercase tracking-wider block">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-background border border-hairline px-3 py-2 text-sm text-foreground focus:outline-none focus:border-accent transition-colors"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent hover:bg-accent-hover text-white text-sm font-semibold py-2.5 transition-colors disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
