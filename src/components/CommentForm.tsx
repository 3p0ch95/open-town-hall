'use client';

import { createComment } from '@/app/actions';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function CommentForm({ postId, path, parentId = null, onCancel }: { postId: string, path: string, parentId?: string | null, onCancel?: () => void }) {
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

    const res = await createComment(postId, body, session.user.id, path, parentId);
    setLoading(false);

    if (res.error) {
        alert(res.error);
    } else {
        setBody('');
        if (onCancel) onCancel(); // Close reply form
        router.refresh();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex gap-3">
        <div className="flex-1">
            <textarea 
                value={body}
                onChange={(e) => setBody(e.target.value)}
                required
                placeholder="What are your thoughts?"
                className="w-full bg-zinc-900 border border-zinc-700 text-zinc-100 rounded-lg p-3 focus:ring-2 focus:ring-emerald-500 focus:outline-none placeholder-zinc-500 text-sm"
                rows={2}
                autoFocus={!!parentId}
            />
            <div className="flex justify-end mt-2 gap-2">
                {onCancel && (
                    <button 
                        type="button" 
                        onClick={onCancel}
                        className="text-zinc-500 text-xs font-bold px-3 py-1 hover:text-zinc-300"
                    >
                        Cancel
                    </button>
                )}
                <button 
                    type="submit" 
                    disabled={loading}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-1.5 px-4 rounded-full transition-all disabled:opacity-50"
                >
                    {loading ? 'Posting...' : 'Reply'}
                </button>
            </div>
        </div>
    </form>
  );
}
