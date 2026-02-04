import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import CommentForm from '@/components/CommentForm';
import DeletePostButton from '@/components/DeletePostButton';

export const revalidate = 0;

export default async function PostPage({ params }: { params: Promise<{ name: string, postId: string }> }) {
  const { name, postId } = await params;

  // 1. Fetch Post + Community
  const { data: post } = await supabase
    .from('posts')
    .select(`
        *,
        communities (id, name),
        profiles (username)
    `)
    .eq('id', postId)
    .single();

  if (!post) return notFound();

  // 2. Fetch Comments
  const { data: comments } = await supabase
    .from('comments')
    .select(`
        *,
        profiles (username, avatar_url)
    `)
    .eq('post_id', postId)
    .order('created_at', { ascending: true });

  // 3. Check Mod Status (Server Side)
  // We need to know if the current viewer is a mod to show the delete button.
  // BUT we are in a server component with no direct session access unless we use cookies.
  // For MVP, we will render the button conditionally on the CLIENT (inside the component) 
  // or just render it and let the server action reject it if unauthorized.
  // Let's render it but check permissions in the button component logic? 
  // Better: Fetch moderators list and pass it down.
  
  const { data: mods } = await supabase
    .from('moderators')
    .select('user_id')
    .eq('community_id', post.communities.id);
  
  const modIds = mods?.map((m: any) => m.user_id) || [];

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Post Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
            <div className="flex">
                <div className="w-12 bg-zinc-950/50 flex flex-col items-center py-4 gap-2 border-r border-zinc-800">
                    <button className="text-zinc-500 hover:text-emerald-500">▲</button>
                    <span className="text-sm font-bold text-zinc-300">{post.upvotes}</span>
                    <button className="text-zinc-500 hover:text-red-500">▼</button>
                </div>
                <div className="p-6 flex-1">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-xs text-zinc-400">
                            <span className="font-bold text-zinc-200 hover:underline">r/{post.communities.name}</span>
                            <span>•</span>
                            <span>Posted by u/{post.profiles.username}</span>
                            <span>•</span>
                            <span>{new Date(post.created_at).toLocaleDateString()}</span>
                        </div>
                        
                        {/* Mod Actions Placeholder - Client component will check auth */}
                        <DeletePostButton postId={post.id} communityId={post.communities.id} />
                    </div>

                    <h1 className="text-2xl font-bold text-white mb-4 leading-snug">{post.title}</h1>
                    <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap text-lg">{post.body}</p>
                </div>
            </div>
        </div>

        {/* Comment Section */}
        <div className="mt-8 bg-zinc-950 rounded-xl border border-zinc-900 p-6">
            <h3 className="text-lg font-bold text-white mb-6">Comments ({comments?.length || 0})</h3>
            
            <CommentForm postId={post.id} path={`/r/${name}/posts/${postId}`} />

            <div className="mt-8 space-y-6">
                {comments?.map((comment: any) => (
                    <div key={comment.id} className="flex gap-4 group">
                        <img src={comment.profiles.avatar_url} className="w-8 h-8 rounded-full bg-zinc-800" />
                        <div className="flex-1">
                            <div className="flex items-center gap-2 text-xs text-zinc-500 mb-1">
                                <span className="font-bold text-zinc-300">u/{comment.profiles.username}</span>
                                <span>•</span>
                                <span>{new Date(comment.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            </div>
                            <div className="text-zinc-300 text-sm leading-relaxed">{comment.body}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
}
