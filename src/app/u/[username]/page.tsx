import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import PostCard from '@/components/PostCard';

export const revalidate = 0;

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;

  // 1. Fetch Profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single();

  if (!profile) return notFound();

  // 2. Calculate Stats (Karma)
  // Sum upvotes from all posts by this user
  const { data: posts } = await supabase
    .from('posts')
    .select('upvotes')
    .eq('author_id', profile.id);
  
  const karma = posts?.reduce((acc, post) => acc + (post.upvotes || 0), 0) || 0;

  // 3. Fetch Mod Roles
  const { data: modRoles } = await supabase
    .from('moderators')
    .select(`
        role,
        communities (name)
    `)
    .eq('user_id', profile.id);

  // 4. Fetch Recent Activity (Posts)
  const { data: activity } = await supabase
    .from('posts')
    .select(`
      *,
      communities (name),
      profiles (username)
    `)
    .eq('author_id', profile.id)
    .order('created_at', { ascending: false })
    .limit(10);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Profile Header */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl mb-8">
        <div className="h-32 bg-gradient-to-r from-emerald-900 to-zinc-900 relative">
            <div className="absolute -bottom-12 left-8">
                <img 
                    src={profile.avatar_url} 
                    className="w-24 h-24 rounded-full border-4 border-zinc-900 bg-zinc-800 shadow-md"
                    alt={username} 
                />
            </div>
        </div>
        
        <div className="pt-14 pb-6 px-8 flex justify-between items-start">
            <div>
                <h1 className="text-3xl font-bold text-white">u/{profile.username}</h1>
                <p className="text-zinc-500 text-sm mt-1">Joined {new Date(profile.created_at).toLocaleDateString()}</p>
            </div>
            
            <div className="flex gap-6 text-center">
                <div className="bg-zinc-950 px-4 py-2 rounded-lg border border-zinc-800">
                    <div className="text-2xl font-bold text-emerald-400">{karma}</div>
                    <div className="text-xs text-zinc-500 uppercase tracking-wide font-bold">Karma</div>
                </div>
                <div className="bg-zinc-950 px-4 py-2 rounded-lg border border-zinc-800">
                    <div className="text-2xl font-bold text-blue-400">{posts?.length || 0}</div>
                    <div className="text-xs text-zinc-500 uppercase tracking-wide font-bold">Posts</div>
                </div>
            </div>
        </div>

        {/* Roles Section */}
        {modRoles && modRoles.length > 0 && (
            <div className="px-8 pb-6 border-t border-zinc-800 pt-4">
                <h3 className="text-xs font-bold text-zinc-500 uppercase mb-3">Offices Held</h3>
                <div className="flex flex-wrap gap-2">
                    {modRoles.map((role: any, i: number) => (
                        <span key={i} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            🛡️ {role.role === 'creator' ? 'Founder' : 'Moderator'} of r/{role.communities.name}
                        </span>
                    ))}
                </div>
            </div>
        )}
      </div>

      {/* Activity Feed */}
      <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
      <div className="space-y-4">
        {activity?.map((post: any) => (
            <PostCard key={post.id} post={post} />
        ))}

        {(!activity || activity.length === 0) && (
            <div className="text-center py-10 text-zinc-600 bg-zinc-900 rounded-xl border border-dashed border-zinc-800">
                This user has not posted anything yet.
            </div>
        )}
      </div>
    </div>
  );
}
