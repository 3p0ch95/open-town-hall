import Link from 'next/link';
import CreatePostForm from '@/components/CreatePostForm';

export default function PostCard({ post }: { post: any }) {
  return (
    <div className="bg-zinc-900 rounded-xl border border-zinc-800 shadow-sm hover:border-emerald-500/50 hover:shadow-[0_0_20px_rgba(16,185,129,0.1)] transition-all group">
      <div className="flex">
        {/* Vote Column */}
        <div className="w-12 bg-zinc-950/30 flex flex-col items-center py-3 gap-1 border-r border-zinc-800 group-hover:border-zinc-700 transition-colors">
          <button className="text-zinc-600 hover:text-emerald-500 transition-colors">▲</button>
          <span className="text-sm font-bold text-zinc-400 group-hover:text-zinc-200 transition-colors">{post.upvotes}</span>
          <button className="text-zinc-600 hover:text-red-500 transition-colors">▼</button>
        </div>
        {/* Content */}
        <div className="p-4 flex-1">
          <div className="flex items-center gap-2 text-xs text-zinc-500 mb-2">
            <Link href={`/r/${post.communities?.name}`} className="font-bold text-zinc-300 hover:text-emerald-400 z-10 relative hover:underline">
              r/{post.communities?.name}
            </Link>
            <span>•</span>
            <Link href={`/u/${post.profiles?.username || 'unknown'}`} className="hover:text-zinc-300 hover:underline z-10 relative">
              Posted by u/{post.profiles?.username || 'Unknown'}
            </Link>
            <span>•</span>
            <span>{new Date(post.created_at).toLocaleDateString()}</span>
          </div>
          <Link href={`/r/${post.communities.name}/posts/${post.id}`} className="block">
            <h2 className="text-lg font-medium text-white leading-snug mb-2 group-hover:text-emerald-400 transition-colors">{post.title}</h2>
            <p className="text-sm text-zinc-400 mb-4 line-clamp-3">{post.body}</p>
          </Link>
          <div className="flex gap-4 text-xs font-bold text-zinc-500">
              <Link href={`/r/${post.communities.name}/posts/${post.id}`} className="flex items-center gap-1 hover:bg-zinc-800 px-2 py-1 rounded transition-colors">💬 Comments</Link>
              <div className="flex items-center gap-1 hover:bg-zinc-800 px-2 py-1 rounded transition-colors cursor-pointer">↪️ Share</div>
          </div>
        </div>
      </div>
    </div>
  );
}
