'use server';

import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function startElection(communityId: string, communityName: string) {
  // 1. Check for active elections
  const { data: existing } = await supabase
    .from('elections')
    .select('id')
    .eq('community_id', communityId)
    .eq('status', 'active')
    .single();

  if (existing) {
    return { error: 'An election is already in progress!' };
  }

  // 2. Create new election (30 days)
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(startDate.getDate() + 30);

  const { error } = await supabase.from('elections').insert({
    community_id: communityId,
    start_date: startDate.toISOString(),
    end_date: endDate.toISOString(),
    status: 'active'
  });

  if (error) return { error: error.message };

  revalidatePath(`/r/${communityName}/elections`);
  return { success: true };
}

export async function declareCandidacy(electionId: string, userId: string, manifesto: string, communityName: string) {
  // Check if already running
  const { data: existing } = await supabase
    .from('candidates')
    .select('id')
    .eq('election_id', electionId)
    .eq('user_id', userId)
    .single();

  if (existing) {
    return { error: 'You are already running in this election!' };
  }

  const { error } = await supabase.from('candidates').insert({
    election_id: electionId,
    user_id: userId,
    manifesto: manifesto,
    vote_count: 0
  });

  if (error) return { error: error.message };

  revalidatePath(`/r/${communityName}/elections`);
  return { success: true };
}

export async function castVote(electionId: string, candidateId: string, voterId: string, communityName: string) {
    // 1. Check if user already voted in this election
    const { data: existingVote } = await supabase
        .from('election_votes')
        .select('voter_id')
        .eq('election_id', electionId)
        .eq('voter_id', voterId)
        .single();

    if (existingVote) {
        return { error: 'You have already voted in this election.' };
    }

    // 2. Insert vote
    const { error: voteError } = await supabase
        .from('election_votes')
        .insert({
            election_id: electionId,
            voter_id: voterId,
            candidate_id: candidateId
        });
    
    if (voteError) return { error: voteError.message };

    // 3. Increment candidate count (Atomic increment would be better via RPC, but fetching+update is OK for MVP)
    // Actually, let's just do a simple RPC call if we had one, but we'll stick to a naive fetch-update for now 
    // or rely on a count query. Let's do a naive update for speed.
    // Supabase allows `rpc` for atomic increments, but we haven't defined one.
    // We'll trust the count aggregation on read, OR update the column.
    
    const { data: candidate } = await supabase.from('candidates').select('vote_count').eq('id', candidateId).single();
    const newCount = (candidate?.vote_count || 0) + 1;

    await supabase.from('candidates').update({ vote_count: newCount }).eq('id', candidateId);

    revalidatePath(`/r/${communityName}/elections`);
    return { success: true };
}
