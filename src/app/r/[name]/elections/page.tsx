import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import StartElectionButton from '@/components/StartElectionButton';

export const revalidate = 0;

export default async function ElectionsPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;

  // 1. Fetch Community
  const { data: community } = await supabase.from('communities').select('*').eq('name', name).single();
  if (!community) return notFound();

  // 2. Fetch Elections
  const { data: elections } = await supabase
    .from('elections')
    .select('*')
    .eq('community_id', community.id)
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h1 className="text-3xl font-bold text-gray-900">r/{community.name}</h1>
        <div className="flex gap-4 mt-4 text-sm font-medium text-gray-500 border-b border-gray-100 pb-2">
            <Link href={`/r/${name}`} className="hover:text-gray-900 pb-2">Posts</Link>
            <span className="text-blue-600 border-b-2 border-blue-600 pb-2">Elections 🗳️</span>
            <Link href={`/r/${name}/mods`} className="hover:text-gray-900 pb-2">Moderators</Link>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-xl font-bold text-blue-900 mb-2">How Democracy Works Here</h2>
        <ul className="list-disc list-inside text-blue-800 space-y-1 text-sm">
            <li>Moderators serve <strong>30-day terms</strong>.</li>
            <li>Any member with 10+ karma can run for office.</li>
            <li>Voting is open to all community members.</li>
            <li>At the end of the term, the top 3 candidates become mods.</li>
        </ul>
        <StartElectionButton communityId={community.id} communityName={community.name} />
      </div>

      <h3 className="text-lg font-bold text-gray-900 mt-8 mb-4">Active Elections</h3>
      
      {(!elections || elections.length === 0) && (
        <div className="bg-white p-8 rounded-lg border border-gray-200 text-center text-gray-500">
            No active elections. The current moderators seem safe... for now. 👑
        </div>
      )}

      {elections?.map((election: any) => (
        <div key={election.id} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex justify-between items-start">
                <div>
                    <h4 className="text-lg font-bold text-gray-900">Term: {new Date(election.start_date).toLocaleDateString()} - {new Date(election.end_date).toLocaleDateString()}</h4>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-2">
                        {election.status === 'active' ? 'Voting Open' : 'Closed'}
                    </span>
                </div>
                <Link href={`/r/${name}/elections/${election.id}`} className="text-blue-600 hover:underline font-medium text-sm">
                    View Candidates →
                </Link>
            </div>
        </div>
      ))}
    </div>
  );
}
