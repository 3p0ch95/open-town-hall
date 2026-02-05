'use client';

import { createProposal, voteOnProposal } from '@/app/actions';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export function CreateProposalForm() {
    const [title, setTitle] = useState('');
    const [desc, setDesc] = useState('');
    const [key, setKey] = useState('daily_energy_limit');
    const [value, setValue] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        
        await createProposal(title, desc, key, value, session.user.id);
        setLoading(false);
        router.refresh();
        setTitle(''); setDesc(''); setValue('');
    };

    return (
        <form onSubmit={handleSubmit} className="bg-zinc-900 p-6 rounded-lg border border-zinc-800 space-y-4">
            <h3 className="font-bold text-white">Draft New Proposal</h3>
            <input className="w-full bg-zinc-950 border border-zinc-700 p-2 rounded text-white" placeholder="Title (e.g. Increase Energy Cap)" value={title} onChange={e => setTitle(e.target.value)} required />
            <textarea className="w-full bg-zinc-950 border border-zinc-700 p-2 rounded text-white" placeholder="Description / Argument" value={desc} onChange={e => setDesc(e.target.value)} required />
            <div className="grid grid-cols-2 gap-4">
                <select className="bg-zinc-950 border border-zinc-700 p-2 rounded text-white" value={key} onChange={e => setKey(e.target.value)}>
                    <option value="daily_energy_limit">Daily Energy Limit</option>
                    <option value="election_term_days">Election Term (Days)</option>
                </select>
                <input className="bg-zinc-950 border border-zinc-700 p-2 rounded text-white" placeholder="New Value (e.g. 15)" value={value} onChange={e => setValue(e.target.value)} required />
            </div>
            <button disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded">Submit Proposal (Costs 1 Energy)</button>
        </form>
    );
}

export function VoteProposalButton({ proposalId, vote }: { proposalId: string, vote: 'yes'|'no' }) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    
    const handleVote = async () => {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        await voteOnProposal(proposalId, vote, session.user.id);
        setLoading(false);
        router.refresh();
    };

    return (
        <button 
            onClick={handleVote} 
            disabled={loading}
            className={`px-3 py-1 rounded text-sm font-bold ${vote === 'yes' ? 'bg-green-900/50 text-green-400 hover:bg-green-900' : 'bg-red-900/50 text-red-400 hover:bg-red-900'}`}
        >
            {vote.toUpperCase()}
        </button>
    );
}
