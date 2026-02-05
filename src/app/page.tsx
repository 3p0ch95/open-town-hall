import { createClient } from '@/lib/server-supabase';
import Link from 'next/link';
import CreatePostForm from '@/components/CreatePostForm';
import { redirect } from 'next/navigation';
import PostCard from '@/components/PostCard';

export const revalidate = 0; // Disable static caching

export default async function Home() {
  const supabase = await createClient(); // Use SSR client

  // 1. Check User Session
  const { data: { user } } = await supabase.auth.getUser();

  // --------------------------------------------------------------------------
  // LOGGED OUT VIEW: "OpenClaw Style" Landing Page
  // --------------------------------------------------------------------------
  if (!user) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white font-mono flex flex-col">
        {/* Hero Section */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 text-center sm:px-6 lg:px-8 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute top-[20%] left-[10%] w-72 h-72 bg-emerald-500 rounded-full blur-[128px]"></div>
            <div className="absolute bottom-[20%] right-[10%] w-96 h-96 bg-blue-600 rounded-full blur-[128px]"></div>
          </div>

          <div className="relative z-10 max-w-4xl space-y-8">
            <div className="inline-block px-3 py-1 rounded-full border border-zinc-700 bg-zinc-900/50 text-zinc-400 text-xs tracking-widest uppercase">
              v0.4.2 • System Online
            </div>
            
            <h1 className="text-5xl sm:text-7xl font-bold tracking-tighter text-white">
              The Social Network <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">
                Belongs to You.
              </span>
            </h1>

            <p className="max-w-2xl mx-auto text-lg sm:text-xl text-zinc-400 leading-relaxed">
              No dictators. No black-box algorithms. Just democracy. <br />
              Moderators are <strong>elected</strong> by the community, every 30 days.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <Link 
                href="/auth" 
                className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-lg px-8 py-4 rounded-md transition-all hover:scale-105 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
              >
                Join the Republic
              </Link>
              <Link 
                href="/constitution" 
                className="border border-zinc-700 hover:bg-zinc-800 text-zinc-300 font-medium text-lg px-8 py-4 rounded-md transition-colors"
              >
                View Constitution
              </Link>
            </div>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="border-t border-zinc-900 bg-zinc-950/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl bg-zinc-900/50 border border-zinc-800 hover:border-emerald-500/30 transition-colors">
              <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                <span className="text-emerald-500">01.</span> Democracy First
              </h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Moderators serve 30-day terms. If they fail the community, vote them out. Power is temporary and earned.
              </p>
            </div>
            <div className="p-6 rounded-xl bg-zinc-900/50 border border-zinc-800 hover:border-blue-500/30 transition-colors">
              <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                 <span className="text-blue-500">02.</span> Scarce Influence
              </h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                You get <strong>10 Energy</strong> per day. Spend it wisely on posts or votes. This creates high signal, low noise discussions.
              </p>
            </div>
            <div className="p-6 rounded-xl bg-zinc-900/50 border border-zinc-800 hover:border-purple-500/30 transition-colors">
              <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                 <span className="text-purple-500">03.</span> Open Source
              </h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                The code is public. The database schema is transparent. Nothing is hidden from the user. You can verify everything.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // LOGGED IN VIEW: The Feed (Original App)
  // --------------------------------------------------------------------------

  // Fetch posts from Supabase
  const { data: posts } = await supabase
    .from('posts')
    .select(`
      *,
      communities (name),
      profiles (username)
    `)
    .order('created_at', { ascending: false });

  // Fetch communities for sidebar
  const { data: communities } = await supabase
    .from('communities')
    .select('*')
    .limit(5);

  return (
    <div className="min-h-screen font-sans bg-zinc-950 text-zinc-100">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left Sidebar - Navigation */}
        <aside className="hidden md:block md:col-span-3 lg:col-span-2 space-y-4">
          <nav className="space-y-1">
            <a href="#" className="block px-3 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md font-medium text-sm">Home</a>
            <a href="#" className="block px-3 py-2 text-zinc-400 hover:bg-zinc-900 rounded-md transition-colors text-sm">Popular</a>
            <a href="#" className="block px-3 py-2 text-zinc-400 hover:bg-zinc-900 rounded-md transition-colors text-sm">All</a>
          </nav>
          
          <div className="pt-4 border-t border-zinc-800">
            <h3 className="px-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Communities</h3>
            <div className="mt-2 space-y-1">
              {communities?.map((comm: any) => (
                <Link key={comm.id} href={`/r/${comm.name}`} className="block px-3 py-2 text-zinc-400 hover:bg-zinc-900 hover:text-white rounded-md truncate transition-colors text-sm">
                  r/{comm.name}
                </Link>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Feed */}
        <div className="md:col-span-9 lg:col-span-7 space-y-6">
          {/* Create Post Form */}
          <CreatePostForm />

          {/* Posts Feed */}
          {posts?.map((post: any) => (
             <PostCard key={post.id} post={post} />
          ))}
          
          {(!posts || posts.length === 0) && (
            <div className="text-center py-10 text-zinc-600 border border-dashed border-zinc-800 rounded-xl">
              No posts yet. Be the first!
            </div>
          )}
        </div>

        {/* Right Sidebar - Info */}
        <div className="hidden lg:block lg:col-span-3 space-y-6">
           <div className="bg-zinc-900 rounded-xl border border-zinc-800 shadow-sm p-5">
              <h3 className="font-bold text-white mb-2 text-sm uppercase tracking-wide">Home Feed</h3>
              <p className="text-sm text-zinc-400 mb-4 leading-relaxed">
                Welcome to your personal frontpage. Subscribe to communities to see them here.
              </p>
              <div className="space-y-2">
                 <Link href="/communities/create" className="block w-full text-center border border-zinc-700 hover:bg-zinc-800 text-zinc-300 font-bold py-2 px-4 rounded-full transition-colors text-sm">Create Community</Link>
                 <Link href="/constitution" className="block w-full text-center border border-emerald-900/30 text-emerald-500 hover:bg-emerald-900/20 font-bold py-2 px-4 rounded-full transition-colors text-sm">
                    View Constitution
                 </Link>
              </div>
           </div>
           
           <div className="text-xs text-zinc-600 px-4">
              OpenTownHall v0.4.1 <br/>
              <a href="#" className="hover:underline">Privacy</a> • <a href="#" className="hover:underline">Terms</a>
           </div>
        </div>
      </main>
    </div>
  );
}
