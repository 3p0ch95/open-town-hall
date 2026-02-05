import { supabase } from '@/lib/supabase';
import { CreateProposalForm, VoteProposalButton } from '@/components/ConstitutionTools';

export const revalidate = 0;

export default async function ConstitutionPage() {
  // 1. Fetch Current Config
  const { data: config } = await supabase.from('system_config').select('*');
  const energyLimit = config?.find(c => c.key === 'daily_energy_limit')?.value || '10';
  const termLimit = config?.find(c => c.key === 'election_term_days')?.value || '30';

  // 2. Fetch Active Proposals
  const { data: proposals } = await supabase
    .from('proposals')
    .select('*, profiles(username)')
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-4xl font-bold text-white mb-2">📜 The Living Constitution</h1>
      <p className="text-zinc-400 mb-8">This document is not static. It is code. It is law. And you can patch it.</p>

      {/* Current Laws */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-lg">
            <h3 className="text-zinc-500 uppercase text-xs font-bold mb-2">Daily Energy Cap</h3>
            <div className="text-4xl font-bold text-emerald-400">{energyLimit} Actions</div>
            <p className="text-zinc-600 text-sm mt-2">Maximum actions a citizen can perform per 24h cycle.</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-lg">
            <h3 className="text-zinc-500 uppercase text-xs font-bold mb-2">Election Term Length</h3>
            <div className="text-4xl font-bold text-blue-400">{termLimit} Days</div>
            <p className="text-zinc-600 text-sm mt-2">Duration of a moderator's term before re-election.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
            <h2 className="text-2xl font-bold text-white">Active Proposals</h2>
            {proposals?.map((prop: any) => (
                <div key={prop.id} className="bg-zinc-900 border border-zinc-800 p-6 rounded-lg">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-bold text-white">{prop.title}</h3>
                        <span className="text-xs text-zinc-500 bg-zinc-950 px-2 py-1 rounded">By u/{prop.profiles.username}</span>
                    </div>
                    <p className="text-zinc-300 mb-4">{prop.description}</p>
                    <div className="bg-zinc-950 p-3 rounded mb-4 text-sm font-mono text-zinc-400">
                        CHANGE <span className="text-yellow-500">{prop.target_config_key}</span> TO <span className="text-emerald-500">{prop.target_value}</span>
                    </div>
                    
                    {/* Voting Bar */}
                    <div className="flex items-center gap-4">
                        <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden flex">
                            <div style={{ width: `${(prop.yes_votes / ((prop.yes_votes + prop.no_votes) || 1)) * 100}%` }} className="bg-green-500 h-full"></div>
                        </div>
                        <div className="flex gap-2">
                             <span className="text-green-500 font-bold">{prop.yes_votes}</span>
                             <span className="text-red-500 font-bold">{prop.no_votes}</span>
                        </div>
                        <div className="flex gap-2">
                            <VoteProposalButton proposalId={prop.id} vote="yes" />
                            <VoteProposalButton proposalId={prop.id} vote="no" />
                        </div>
                    </div>
                </div>
            ))}
             {(!proposals || proposals.length === 0) && <p className="text-zinc-600">No active proposals. The Republic is stable.</p>}
        </div>

        <div>
            <CreateProposalForm />
        </div>
      </div>
    </div>
  );
}
