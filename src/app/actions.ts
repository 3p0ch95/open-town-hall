import { createClient } from '@/lib/server-supabase';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// Helper: Get System Config
async function getConfig(key: string, defaultValue: string) {
    const supabase = await createClient();
    const { data } = await supabase.from('system_config').select('value').eq('key', key).single();
    return data?.value || defaultValue;
}

// Helper: Check and Spend Daily Action
async function spendAction(userId: string) {
    const supabase = await createClient();
    const today = new Date().toISOString().split('T')[0];
    
    // 1. Get dynamic limit
    const limitStr = await getConfig('daily_energy_limit', '10');
    const limit = parseInt(limitStr);

    // 2. Get current usage
    const { data } = await supabase
      .from('daily_usage')
      .select('action_count')
      .eq('user_id', userId)
      .eq('usage_date', today)
      .single();
      
    const current = data?.action_count || 0;
    
    if (current >= limit) {
        throw new Error(`You have used all ${limit} actions for today! Recharge tomorrow.`);
    }
    
    // 3. Increment
    const { error } = await supabase
      .from('daily_usage')
      .upsert({ 
          user_id: userId, 
          usage_date: today, 
          action_count: current + 1 
      });
      
    if (error) throw new Error("Failed to record action usage.");
}

// Helper: Check Ban Status
async function checkBan(userId: string, communityId: string) {
    const supabase = await createClient();
    const { data } = await supabase
        .from('community_bans')
        .select('reason')
        .eq('user_id', userId)
        .eq('community_id', communityId)
        .single();
    
    if (data) {
        throw new Error(`You are banned from this community. Reason: ${data.reason}`);
    }
}

export async function createPost(title: string, body: string, communityId: string, userId: string, imageUrl: string | null = null) {
    const supabase = await createClient();
    try { await spendAction(userId); } catch (e: any) { return { error: e.message }; }
    try { await checkBan(userId, communityId); } catch (e: any) { return { error: e.message }; }

    const { error } = await supabase.from('posts').insert({
        title,
        body,
        image_url: imageUrl,
        community_id: communityId,
        author_id: userId
    });

    if (error) return { error: error.message };

    revalidatePath('/');
    return { success: true };
}

export async function createComment(postId: string, body: string, userId: string, path: string, parentId: string | null = null) {
    const supabase = await createClient();
    try { await spendAction(userId); } catch (e: any) { return { error: e.message }; }
    
    // Need community_id to check ban... fetch post first
    const { data: post } = await supabase.from('posts').select('community_id').eq('id', postId).single();
    if (post) {
         try { await checkBan(userId, post.community_id); } catch (e: any) { return { error: e.message }; }
    }

    const { error } = await supabase.from('comments').insert({
        post_id: postId,
        body,
        author_id: userId,
        parent_id: parentId
    });

    if (error) return { error: error.message };

    revalidatePath(path);
    return { success: true };
}

export async function deletePost(postId: string, userId: string, communityId: string) {
    const supabase = await createClient();
    // 1. Check Mod
    const { data: mod } = await supabase
        .from('moderators')
        .select('*')
        .eq('community_id', communityId)
        .eq('user_id', userId)
        .single();

    if (!mod) return { error: 'Unauthorized.' };

    // 2. Log Action
    await supabase.from('mod_logs').insert({
        community_id: communityId,
        moderator_id: userId,
        action_type: 'delete_post',
        target_id: postId,
        reason: 'Moderator deletion'
    });

    // 3. Delete
    const { error } = await supabase.from('posts').delete().eq('id', postId);

    if (error) return { error: error.message };

    revalidatePath('/');
    return { success: true };
}

export async function banUser(targetUsername: string, communityId: string, modId: string, reason: string) {
    const supabase = await createClient();
    // 1. Check Mod
    const { data: mod } = await supabase.from('moderators').select('*').eq('community_id', communityId).eq('user_id', modId).single();
    if (!mod) return { error: 'Unauthorized.' };

    // 2. Find Target User ID
    const { data: target } = await supabase.from('profiles').select('id').eq('username', targetUsername).single();
    if (!target) return { error: 'User not found.' };

    // 3. Ban
    const { error } = await supabase.from('community_bans').insert({
        community_id: communityId,
        user_id: target.id,
        reason: reason
    });
    if (error) return { error: error.message };

    // 4. Log
    await supabase.from('mod_logs').insert({
        community_id: communityId,
        moderator_id: modId,
        action_type: 'ban_user',
        target_id: target.id,
        reason: reason
    });

    revalidatePath(`/r/[name]/mod-dashboard`); // Need actual name, but this forces cache clear generally
    return { success: true };
}

// ... Elections ...
export async function startElection(communityId: string, communityName: string, userId: string) {
  const supabase = await createClient();
  try { await spendAction(userId); } catch (e: any) { return { error: e.message }; }

  const { data: existing } = await supabase
    .from('elections')
    .select('id')
    .eq('community_id', communityId)
    .eq('status', 'active')
    .single();

  if (existing) {
    return { error: 'An election is already in progress!' };
  }

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
  const supabase = await createClient();
  try { await spendAction(userId); } catch (e: any) { return { error: e.message }; }

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
    const supabase = await createClient();
    try { await spendAction(voterId); } catch (e: any) { return { error: e.message }; }

    const { data: existingVote } = await supabase
        .from('election_votes')
        .select('voter_id')
        .eq('election_id', electionId)
        .eq('voter_id', voterId)
        .single();

    if (existingVote) {
        return { error: 'You have already voted in this election.' };
    }

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

// ... Constitution ...
export async function createProposal(title: string, description: string, key: string, value: string, userId: string) {
    const supabase = await createClient();
    try { await spendAction(userId); } catch (e: any) { return { error: e.message }; }

    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 7); // 1 week voting

    const { error } = await supabase.from('proposals').insert({
        title,
        description,
        target_config_key: key,
        target_value: value,
        created_by: userId,
        end_date: endDate.toISOString()
    });

    if (error) return { error: error.message };
    revalidatePath('/constitution');
    return { success: true };
}

export async function voteOnProposal(proposalId: string, vote: 'yes' | 'no', userId: string) {
    const supabase = await createClient();
    try { await spendAction(userId); } catch (e: any) { return { error: e.message }; }

    const { data: existing } = await supabase.from('proposal_votes').select('user_id').eq('proposal_id', proposalId).eq('user_id', userId).single();
    if (existing) return { error: 'Already voted.' };

    await supabase.from('proposal_votes').insert({ proposal_id: proposalId, user_id: userId, vote });
    
    // Naive increment
    const { data: prop } = await supabase.from('proposals').select('yes_votes, no_votes').eq('id', proposalId).single();
    if (vote === 'yes') {
        await supabase.from('proposals').update({ yes_votes: (prop?.yes_votes || 0) + 1 }).eq('id', proposalId);
    } else {
        await supabase.from('proposals').update({ no_votes: (prop?.no_votes || 0) + 1 }).eq('id', proposalId);
    }

    revalidatePath('/constitution');
    return { success: true };
}
