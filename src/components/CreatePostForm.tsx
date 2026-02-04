'use client';

import { createPost } from '@/app/actions';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function CreatePostForm({ preselectedCommunityId }: { preselectedCommunityId?: string }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [communityId, setCommunityId] = useState(preselectedCommunityId || '');
  const [communities, setCommunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    // Get current user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Fetch communities to populate the dropdown
    const fetchCommunities = async () => {
      const { data } = await supabase.from('communities').select('id, name');
      if (data) {
        setCommunities(data);
        if (!preselectedCommunityId && !communityId && data.length > 0) setCommunityId(data[0].id);
      }
    };
    fetchCommunities();
  }, [preselectedCommunityId, communityId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return alert('You must be logged in!');
    setLoading(true);

    const res = await createPost(title, body, communityId, user.id);

    setLoading(false);

    if (res.error) {
      alert(res.error);
    } else {
      setTitle('');
      setBody('');
      // Force refresh to update Navbar usage count too?
      // window.location.reload(); // Hard refresh to update Navbar count for now
      router.refresh(); 
    }
  };


  if (!user) {
    return (
      <div className="bg-white p-4 rounded-md border border-gray-200 shadow-sm flex items-center justify-between text-gray-500">
        <span>Log in to start posting!</span>
        <button onClick={() => router.push('/auth')} className="text-blue-600 font-bold hover:underline">Log In</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-md border border-gray-200 shadow-sm space-y-3">
      <div className="flex gap-2 mb-2">
        <select 
          value={communityId}
          onChange={(e) => setCommunityId(e.target.value)}
          className="bg-gray-100 border border-gray-300 text-gray-900 text-xs rounded-full focus:ring-blue-500 focus:border-blue-500 block px-3 py-1"
        >
          {communities.map((c) => (
            <option key={c.id} value={c.id}>r/{c.name}</option>
          ))}
        </select>
      </div>

      <input 
        type="text" 
        placeholder="Title" 
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        className="w-full bg-transparent text-lg font-medium placeholder-gray-400 focus:outline-none" 
      />
      
      <textarea 
        placeholder="Text (optional)" 
        value={body}
        onChange={(e) => setBody(e.target.value)}
        className="w-full bg-transparent text-sm text-gray-800 placeholder-gray-400 focus:outline-none resize-y min-h-[60px]" 
      />

      <div className="flex justify-end pt-2 border-t border-gray-100">
        <button 
          type="submit" 
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-1.5 px-4 rounded-full transition-colors disabled:opacity-50"
        >
          {loading ? 'Posting...' : 'Post'}
        </button>
      </div>
    </form>
  );
}
