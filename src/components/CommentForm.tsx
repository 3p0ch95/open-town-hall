'use client';

import { createComment } from '@/app/actions';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function CommentForm({ postId, path }: { postId: string, path: string }) {
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        alert('Log in to comment.');
        setLoading(false);
        return;
    }

    const res = await createComment(postId, body, session.user.id, path);
    setLoading(false);

    if (res.error) {
        alert(res.error);
    } else {
        setBody('');
        router.refresh();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex gap-4">
        <div className="w-10 h-10 rounded-full bg-zinc-800 flex-shrink-0"></div>
        <div className="flex-1">
            <textarea 
                value={body}
                onChange={(e) => setBody(e.target.value)}
                required
                placeholder="What are your thoughts?"
                className="w-full bg-zinc-900 border border-zinc-700 text-zinc-100 rounded-lg p-3 focus:ring-2 focus:ring-emerald-500 focus:outline-none placeholder-zinc-500"
                rows={3}
            />
            <div className="flex justify-end mt-2">
                <button 
                    type="submit" 
                    disabled={loading}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold py-2 px-6 rounded-full transition-all disabled:opacity-50 shadow-lg shadow-emerald-900/20"
                >
                    {loading ? 'Posting...' : 'Comment'}
                </button>
            </div>
        </div>
    </form>
  );
}
