'use client';

import { deletePost } from '@/app/actions';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function DeletePostButton({ postId, communityId }: { postId: string, communityId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm('MOD ACTION: Are you sure you want to delete this post? This cannot be undone.')) return;
    
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const res = await deletePost(postId, session.user.id, communityId);
    setLoading(false);

    if (res.error) {
        alert(res.error);
    } else {
        router.push('/');
        router.refresh();
    }
  };

  return (
    <button 
        onClick={handleDelete}
        disabled={loading}
        className="text-red-500 hover:text-red-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1 disabled:opacity-50"
    >
        {loading ? 'Deleting...' : '🗑️ Delete Post'}
    </button>
  );
}
