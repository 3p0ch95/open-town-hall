'use client';

import { castVote } from '@/app/actions';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function VoteButton({ electionId, candidateId, communityName }: { electionId: string, candidateId: string, communityName: string }) {
  const [loading, setLoading] = useState(false);

  const handleVote = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        alert('Please log in to vote.');
        setLoading(false);
        return;
    }

    const res = await castVote(electionId, candidateId, session.user.id, communityName);
    setLoading(false);

    if (res.error) {
        alert(res.error);
    }
  };

  return (
    <button 
        onClick={handleVote}
        disabled={loading}
        className="bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold py-1 px-3 rounded-full text-xs transition-colors disabled:opacity-50"
    >
        {loading ? 'Voting...' : 'Vote'}
    </button>
  );
}
