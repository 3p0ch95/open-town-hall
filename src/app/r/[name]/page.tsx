import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import CreatePostForm from '@/components/CreatePostForm';

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
      profiles (username)
    `)
    .eq('community_id', community.id)
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h1 className="text-3xl font-bold text-gray-900">r/{community.name}</h1>
        <p className="text-gray-600 mt-2">{community.description}</p>
        <div className="flex gap-4 mt-4 text-sm font-medium text-gray-500 border-b border-gray-100 pb-2">
            <span className="text-blue-600 border-b-2 border-blue-600 pb-2">Posts</span>
            <Link href={`/r/${name}/elections`} className="hover:text-gray-900 pb-2">Elections 🗳️</Link>
            <Link href={`/r/${name}/mods`} className="hover:text-gray-900 pb-2">Moderators</Link>
        </div>
      </div>

      {/* Post Input (Auto-selected community) */}
      <CreatePostForm preselectedCommunityId={community.id} />

      {/* Posts Feed */}
      {posts?.map((post: any) => (
        <div key={post.id} className="bg-white rounded-md border border-gray-200 shadow-sm hover:border-gray-300 transition-colors cursor-pointer">
          <div className="flex">
            <div className="w-10 bg-gray-50/50 flex flex-col items-center py-2 gap-1 border-r border-gray-100">
              <button className="text-gray-400 hover:text-orange-500">▲</button>
              <span className="text-sm font-bold text-gray-700">{post.upvotes}</span>
              <button className="text-gray-400 hover:text-blue-500">▼</button>
            </div>
            <div className="p-3 flex-1">
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                <span className="font-bold text-gray-900">Posted by u/{post.profiles?.username || 'Unknown'}</span>
                <span>•</span>
                <span>{new Date(post.created_at).toLocaleDateString()}</span>
              </div>
              <h2 className="text-lg font-medium text-gray-900 leading-snug mb-2">{post.title}</h2>
              <p className="text-sm text-gray-600 mb-4 whitespace-pre-wrap">{post.body}</p>
              <div className="flex gap-4 text-xs font-bold text-gray-500">
                  <button className="flex items-center gap-1 hover:bg-gray-100 px-2 py-1 rounded">💬 Comments</button>
                  <button className="flex items-center gap-1 hover:bg-gray-100 px-2 py-1 rounded">↪️ Share</button>
              </div>
            </div>
          </div>
        </div>
      ))}

      {(!posts || posts.length === 0) && (
        <div className="text-center py-10 text-gray-500 bg-white rounded-lg border border-dashed border-gray-300">
          No posts yet in r/{name}. Be the first!
        </div>
      )}
    </div>
  );
}
