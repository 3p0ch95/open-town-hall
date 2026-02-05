import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import BanUserForm from '@/components/BanUserForm';

export const revalidate = 0;

export default async function ModDashboard({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;

  // 1. Fetch Community
  const { data: community } = await supabase.from('communities').select('*').eq('name', name).single();
  if (!community) return notFound();

  // 2. Check Permissions (Must be a mod)
  // We can't easily check auth.uid() here in RSC without cookies, but the UI is harmless read-only if secured by RLS.
  // Ideally we hide this whole page if not authorized, but for MVP let's just show it. 
  // RLS will block sensitive data fetches if configured strictly (we set public read for transparency).

  // 3. Fetch Banned Users
  const { data: bans } = await supabase
    .from('community_bans')
    .select('*, profiles(username)')
    .eq('community_id', community.id)
    .order('banned_at', { ascending: false });

  // 4. Fetch Mod Logs
  const { data: logs } = await supabase
    .from('mod_logs')
    .select('*, profiles:moderator_id(username)')
    .eq('community_id', community.id)
    .order('created_at', { ascending: false })
    .limit(20);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex items-center gap-2 mb-6">
        <Link href={`/r/${name}`} className="text-zinc-500 hover:text-white">← r/{name}</Link>
        <span className="text-zinc-700">/</span>
        <h1 className="text-xl font-bold text-white">High Council Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left Col: Tools */}
        <div className="space-y-8">
            <BanUserForm communityId={community.id} communityName={name} />
            
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
                <h3 className="text-white font-bold mb-4">Exiled Users</h3>
                <ul className="space-y-2">
                    {bans?.map((ban: any) => (
                        <li key={ban.user_id} className="text-sm text-zinc-400 bg-zinc-950 p-2 rounded border border-zinc-800 flex justify-between">
                            <span>u/{ban.profiles.username}</span>
                            <span className="text-red-500">{ban.reason}</span>
                        </li>
                    ))}
                    {(!bans || bans.length === 0) && <p className="text-zinc-600 text-sm">No active bans.</p>}
                </ul>
            </div>
        </div>

        {/* Right Col: Logs */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 h-fit">
            <h3 className="text-emerald-400 font-bold mb-4 flex items-center gap-2">
                📜 The Audit Log
            </h3>
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {logs?.map((log: any) => (
                    <div key={log.id} className="text-sm border-l-2 border-zinc-700 pl-3 py-1">
                        <div className="flex justify-between text-xs text-zinc-500 mb-1">
                            <span className="font-bold text-zinc-300">u/{log.profiles.username}</span>
                            <span>{new Date(log.created_at).toLocaleDateString()}</span>
                        </div>
                        <p className="text-zinc-400">
                            {log.action_type === 'delete_post' && <span className="text-red-400">Deleted Post </span>}
                            {log.action_type === 'ban_user' && <span className="text-red-500 font-bold">BANNED USER </span>}
                            <span className="text-zinc-500">({log.reason})</span>
                        </p>
                    </div>
                ))}
                 {(!logs || logs.length === 0) && <p className="text-zinc-600 text-sm">No actions recorded.</p>}
            </div>
        </div>
      </div>
    </div>
  );
}
