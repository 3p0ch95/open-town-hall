import Link from 'next/link';

export default function PostCard({ post }: { post: any }) {
  return (
    <div className="bg-zinc-900 rounded-xl border border-zinc-800 shadow-sm hover:border-emerald-500/50 hover:shadow-[0_0_20px_rgba(16,185,129,0.1)] transition-all group">
      <div className="flex">
        {/* Vote Column */}
        <div className="w-12 bg-zinc-950/30 flex flex-col items-center py-3 gap-1 border-r border-zinc-800 group-hover:border-zinc-700 transition-colors">
          <button className="text-zinc-600 hover:text-emerald-500 transition-colors p-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
          </button>
          <span className="text-sm font-bold text-zinc-400 group-hover:text-zinc-200 transition-colors">{post.upvotes}</span>
          <button className="text-zinc-600 hover:text-red-500 transition-colors p-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </button>
        </div>
        
        {/* Content */}
        <div className="p-4 flex-1">
          <div className="flex items-center gap-2 text-xs text-zinc-500 mb-2">
            <Link href={`/r/${post.communities?.name}`} className="font-bold text-zinc-300 hover:text-emerald-400 z-10 relative hover:underline">
              r/{post.communities?.name}
            </Link>
            <span>•</span>
            <Link href={`/u/${post.profiles?.username || 'unknown'}`} className="hover:text-zinc-300 hover:underline z-10 relative">
              u/{post.profiles?.username || 'Unknown'}
            </Link>
            <span>•</span>
            <span>{new Date(post.created_at).toLocaleDateString()}</span>
          </div>
          <Link href={`/r/${post.communities.name}/posts/${post.id}`} className="block">
            <h2 className="text-lg font-medium text-white leading-snug mb-2 group-hover:text-emerald-400 transition-colors">{post.title}</h2>
            {post.image_url && (
                <div className="mb-4 rounded-lg overflow-hidden border border-zinc-800">
                    <img src={post.image_url} alt="Post content" className="w-full max-h-96 object-cover" />
                </div>
            )}
            <p className="text-sm text-zinc-400 mb-4 line-clamp-3">{post.body}</p>
          </Link>
          <div className="flex gap-4 text-xs font-bold text-zinc-500">
              <Link href={`/r/${post.communities.name}/posts/${post.id}`} className="flex items-center gap-2 hover:bg-zinc-800 px-2 py-1 rounded transition-colors">
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                 <span>Comments</span>
              </Link>
              <div className="flex items-center gap-2 hover:bg-zinc-800 px-2 py-1 rounded transition-colors cursor-pointer">
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                 <span>Share</span>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
}
