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
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchUsage(session.user.id);
    });

    // Listen for changes (login/logout)
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
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">🏛️</span>
          <span className="font-bold text-xl tracking-tight text-gray-900">OpenTownHall</span>
        </Link>
        <div className="flex gap-4 items-center">
          {user ? (
            <>
              {actionsLeft !== null && (
                 <span className={`text-sm font-bold px-2 py-1 rounded-md ${actionsLeft === 0 ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-800'}`}>
                    ⚡ {actionsLeft}/10
                 </span>
              )}
              <span className="text-sm text-gray-600 hidden sm:block">
                Hey, <strong>{user.user_metadata.username || 'Citizen'}</strong>
              </span>
              <button 
                onClick={handleSignOut}
                className="text-gray-600 hover:text-gray-900 font-medium text-sm"
              >
                Log Out
              </button>
            </>
          ) : (
            <Link 
              href="/auth" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full font-medium transition-colors text-sm"
            >
              Log In / Sign Up
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
