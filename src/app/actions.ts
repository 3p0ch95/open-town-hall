'use server';

import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// Helper: Check and Spend Daily Action
async function spendAction(userId: string) {
    const today = new Date().toISOString().split('T')[0];
    
    // 1. Get current usage
    const { data } = await supabase
      .from('daily_usage')
      .select('action_count')
      .eq('user_id', userId)
      .eq('usage_date', today)
      .single();
      
    const current = data?.action_count || 0;
    
    if (current >= 10) {
        throw new Error("You have used all 10 actions for today! Recharge tomorrow.");
    }
    
    // 2. Increment
    const { error } = await supabase
      .from('daily_usage')
      .upsert({ 
          user_id: userId, 
          usage_date: today, 
          action_count: current + 1 
      });
      
    if (error) throw new Error("Failed to record action usage.");
}

export async function createPost(title: string, body: string, communityId: string, userId: string) {
    // 1. Spend Action
    try { await spendAction(userId); } catch (e: any) { return { error: e.message }; }

    // 2. Create Post
    const { error } = await supabase.from('posts').insert({
        title,
        body,
        community_id: communityId,
        author_id: userId
    });

    if (error) return { error: error.message };

    revalidatePath('/');
    return { success: true };
}

export async function startElection(communityId: string, communityName: string, userId: string) {
  try { await spendAction(userId); } catch (e: any) { return { error: e.message }; }

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
  try { await spendAction(userId); } catch (e: any) { return { error: e.message }; }

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
    try { await spendAction(voterId); } catch (e: any) { return { error: e.message }; }

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
    
    const { data: candidate } = await supabase.from('candidates').select('vote_count').eq('id', candidateId).single();
    const newCount = (candidate?.vote_count || 0) + 1;

    await supabase.from('candidates').update({ vote_count: newCount }).eq('id', candidateId);

    revalidatePath(`/r/${communityName}/elections`);
    return { success: true };
}
