'use client';

import { banUser } from '@/app/actions';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function BanUserForm({ communityId, communityName }: { communityId: string, communityName: string }) {
  const [username, setUsername] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleBan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirm(`Are you sure you want to BAN u/${username} from r/${communityName}?`)) return;
    
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const res = await banUser(username, communityId, session.user.id, reason);
    setLoading(false);

    if (res.error) {
        alert(res.error);
    } else {
        alert(`User u/${username} has been exiled.`);
        setUsername('');
        setReason('');
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
        <h3 className="text-red-500 font-bold mb-4 flex items-center gap-2">
            🚫 The Ban Hammer
        </h3>
        <form onSubmit={handleBan} className="space-y-4">
            <div>
                <label className="block text-sm text-zinc-400 mb-1">Target Username</label>
                <input 
                    type="text" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full bg-zinc-950 border border-zinc-700 rounded p-2 text-white"
                />
            </div>
            <div>
                <label className="block text-sm text-zinc-400 mb-1">Reason for Exile</label>
                <input 
                    type="text" 
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required
                    className="w-full bg-zinc-950 border border-zinc-700 rounded p-2 text-white"
                />
            </div>
            <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded transition-colors disabled:opacity-50"
            >
                {loading ? 'Executing...' : 'Ban User'}
            </button>
        </form>
    </div>
  );
}
