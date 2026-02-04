'use client';

import { startElection } from '@/app/actions';
import { useState } from 'react';

export default function StartElectionButton({ communityId, communityName }: { communityId: string, communityName: string }) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (!confirm('Are you sure you want to start a new 30-day election cycle?')) return;
    
    setLoading(true);
    
    // Need user ID
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { alert('Log in first'); setLoading(false); return; }

    const res = await startElection(communityId, communityName, session.user.id);
    setLoading(false);

    if (res.error) {
      alert(res.error);
    }
  };

  return (
    <button 
        onClick={handleClick}
        disabled={loading}
        className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md shadow-sm transition-colors disabled:opacity-50"
    >
        {loading ? 'Starting...' : 'Start New Election (Demo)'}
    </button>
  );
}
