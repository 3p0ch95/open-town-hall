import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import DeclareCandidacyForm from '@/components/DeclareCandidacyForm';
import VoteButton from '@/components/VoteButton';

export const revalidate = 0;

export default async function ElectionPage({ params }: { params: Promise<{ name: string, electionId: string }> }) {
  const { name, electionId } = await params;

  // 1. Fetch Community
  const { data: community } = await supabase.from('communities').select('*').eq('name', name).single();
  if (!community) return notFound();

  // 2. Fetch Election
  const { data: election } = await supabase.from('elections').select('*').eq('id', electionId).single();
  if (!election) return notFound();

  // 3. Fetch Candidates
  const { data: candidates } = await supabase
    .from('candidates')
    .select(`
        *,
        profiles (username, avatar_url)
    `)
    .eq('election_id', electionId)
    .order('vote_count', { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link href={`/r/${name}/elections`} className="hover:underline">← Back to Elections</Link>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Election for r/{name}</h1>
        <p className="text-gray-600 mt-2">
            Term: {new Date(election.start_date).toLocaleDateString()} - {new Date(election.end_date).toLocaleDateString()}
        </p>
        
        <div className="mt-6 border-t border-gray-100 pt-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Candidates ({candidates?.length || 0})</h2>
            
            <div className="space-y-4 mb-8">
                {candidates?.map((candidate: any) => (
                    <div key={candidate.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <img src={candidate.profiles?.avatar_url} alt="Avatar" className="w-12 h-12 rounded-full bg-gray-200" />
                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-gray-900">u/{candidate.profiles?.username}</h3>
                                    <p className="text-sm text-gray-600 mt-1 italic">"{candidate.manifesto}"</p>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-gray-900">{candidate.vote_count}</div>
                                    <div className="text-xs text-gray-500 uppercase tracking-wide">Votes</div>
                                    <div className="mt-2">
                                        <VoteButton 
                                            electionId={electionId} 
                                            candidateId={candidate.id} 
                                            communityName={name} 
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {(!candidates || candidates.length === 0) && (
                    <p className="text-gray-500 italic">No candidates yet. Be the first!</p>
                )}
            </div>

            {election.status === 'active' && (
                <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
                    <h3 className="font-bold text-blue-900 mb-2">Want to lead this community?</h3>
                    <DeclareCandidacyForm electionId={electionId} communityName={name} />
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
