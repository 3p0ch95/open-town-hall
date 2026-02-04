import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import CreatePostForm from '@/components/CreatePostForm';
import PostCard from '@/components/PostCard';

export const revalidate = 0;

export default async function CommunityPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;

  // 1. Fetch Community Details
  const { data: community } = await supabase
    .from('communities')
    .select('*')
    .eq('name', name)
    .single();

  if (!community) return notFound();

  // 2. Fetch Posts for this community
  const { data: posts } = await supabase
    .from('posts')
    .select(`
      *,
      communities (name),
      profiles (username)
    `)
    .eq('community_id', community.id)
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 shadow-sm relative overflow-hidden">
        {/* Banner decoration */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-500 to-blue-500"></div>
        
        <h1 className="text-3xl font-bold text-white mt-2">r/{community.name}</h1>
        <p className="text-zinc-400 mt-2">{community.description}</p>
        
        <div className="flex gap-4 mt-6 text-sm font-medium text-zinc-500 border-b border-zinc-800 pb-2">
            <span className="text-emerald-400 border-b-2 border-emerald-400 pb-2">Posts</span>
            <Link href={`/r/${name}/elections`} className="hover:text-white pb-2 transition-colors">Elections 🗳️</Link>
            <Link href={`/r/${name}/mods`} className="hover:text-white pb-2 transition-colors">Moderators</Link>
        </div>
      </div>

      {/* Post Input (Auto-selected community) */}
      <CreatePostForm preselectedCommunityId={community.id} />

      {/* Posts Feed */}
      {posts?.map((post: any) => (
         <PostCard key={post.id} post={post} />
      ))}

      {(!posts || posts.length === 0) && (
        <div className="text-center py-10 text-zinc-600 bg-zinc-900 rounded-xl border border-dashed border-zinc-800">
          No posts yet in r/{name}. Be the first!
        </div>
      )}
    </div>
  );
}
