'use client';

import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [actionsLeft, setActionsLeft] = useState<number | null>(null);
  const router = useRouter();

  const fetchUsage = async (userId: string) => {
      const today = new Date().toISOString().split('T')[0];
      const { data } = await supabase
        .from('daily_usage')
        .select('action_count')
        .eq('user_id', userId)
        .eq('usage_date', today)
        .single();
      
      const used = data?.action_count || 0;
      setActionsLeft(10 - used);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchUsage(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchUsage(session.user.id);
      if (_event === 'SIGNED_OUT') router.refresh();
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <header className="bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-2xl group-hover:scale-110 transition-transform">🏛️</span>
          <span className="font-bold text-xl tracking-tight text-white group-hover:text-emerald-400 transition-colors">OpenTownHall</span>
        </Link>
        <div className="flex gap-4 items-center">
          {user ? (
            <>
              {actionsLeft !== null && (
                 <span className={`text-xs font-bold px-2 py-1 rounded-full border ${
                    actionsLeft === 0 
                    ? 'bg-red-500/10 text-red-400 border-red-500/20' 
                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                 }`}>
                    ⚡ {actionsLeft}/10
                 </span>
              )}
              <span className="text-sm text-zinc-400 hidden sm:block">
                Hey, <strong className="text-white">{user.user_metadata.username || 'Citizen'}</strong>
              </span>
              <button 
                onClick={handleSignOut}
                className="text-zinc-500 hover:text-white font-medium text-sm transition-colors"
              >
                Log Out
              </button>
            </>
          ) : (
            <Link 
              href="/auth" 
              className="bg-white hover:bg-zinc-200 text-black px-4 py-2 rounded-full font-bold transition-colors text-sm"
            >
              Log In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
