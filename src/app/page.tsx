import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export const revalidate = 0; // Disable static caching for now

export default async function Home() {
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
    <div className="min-h-screen font-sans">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left Sidebar - Navigation */}
        <aside className="hidden md:block md:col-span-3 lg:col-span-2 space-y-4">
          <nav className="space-y-1">
            <a href="#" className="block px-3 py-2 bg-gray-200 text-gray-900 rounded-md font-medium">Home</a>
            <a href="#" className="block px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-md">Popular</a>
            <a href="#" className="block px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-md">All</a>
          </nav>
          
          <div className="pt-4 border-t border-gray-200">
            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Communities</h3>
            <div className="mt-2 space-y-1">
              {communities?.map((comm: any) => (
                <Link key={comm.id} href={`/r/${comm.name}`} className="block px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-md truncate">
                  r/{comm.name}
                </Link>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Feed */}
        <div className="md:col-span-9 lg:col-span-7 space-y-6">
          {/* Create Post Input */}
          <div className="bg-white p-4 rounded-md border border-gray-200 shadow-sm flex gap-3">
             <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0"></div>
             <input type="text" placeholder="Create Post" className="bg-gray-100 border border-gray-200 text-gray-900 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 hover:bg-white transition-colors" />
          </div>

          {/* Posts Feed */}
          {posts?.map((post: any) => (
            <div key={post.id} className="bg-white rounded-md border border-gray-200 shadow-sm hover:border-gray-300 transition-colors cursor-pointer">
              <div className="flex">
                {/* Vote Column */}
                <div className="w-10 bg-gray-50/50 flex flex-col items-center py-2 gap-1 border-r border-gray-100">
                  <button className="text-gray-400 hover:text-orange-500">▲</button>
                  <span className="text-sm font-bold text-gray-700">{post.upvotes}</span>
                  <button className="text-gray-400 hover:text-blue-500">▼</button>
                </div>
                {/* Content */}
                <div className="p-3 flex-1">
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                    <span className="font-bold text-gray-900 hover:underline">r/{post.communities?.name}</span>
                    <span>•</span>
                    <span>Posted by u/{post.profiles?.username}</span>
                    <span>•</span>
                    <span>{new Date(post.created_at).toLocaleDateString()}</span>
                  </div>
                  <h2 className="text-lg font-medium text-gray-900 leading-snug mb-2">{post.title}</h2>
                  <p className="text-sm text-gray-600 mb-4">{post.body}</p>
                  <div className="flex gap-4 text-xs font-bold text-gray-500">
                      <button className="flex items-center gap-1 hover:bg-gray-100 px-2 py-1 rounded">💬 Comments</button>
                      <button className="flex items-center gap-1 hover:bg-gray-100 px-2 py-1 rounded">↪️ Share</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {(!posts || posts.length === 0) && (
            <div className="text-center py-10 text-gray-500">
              No posts yet. Be the first!
            </div>
          )}

        </div>

        {/* Right Sidebar - Info */}
        <div className="hidden lg:block lg:col-span-3 space-y-6">
           <div className="bg-white rounded-md border border-gray-200 shadow-sm p-4">
              <h3 className="font-bold text-gray-900 mb-2">Home</h3>
              <p className="text-sm text-gray-600 mb-4">Your personal open town hall frontpage.</p>
              <div className="space-y-2">
                 <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full transition-colors">Create Post</button>
                 <button className="w-full border border-blue-600 text-blue-600 hover:bg-blue-50 font-bold py-2 px-4 rounded-full transition-colors">Create Community</button>
              </div>
           </div>
        </div>
      </main>
    </div>
  );
}
