'use client';

import { createPost } from '@/app/actions';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function CreatePostForm({ preselectedCommunityId }: { preselectedCommunityId?: string }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [communityId, setCommunityId] = useState(preselectedCommunityId || '');
  const [communities, setCommunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

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

    let imageUrl = null;

    // 1. Upload Image (if selected)
    if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
            .from('post_images')
            .upload(fileName, imageFile);

        if (uploadError) {
            alert(`Upload failed: ${uploadError.message}`);
            setLoading(false);
            return;
        }

        // Get Public URL
        const { data: { publicUrl } } = supabase.storage
            .from('post_images')
            .getPublicUrl(fileName);
            
        imageUrl = publicUrl;
    }

    // 2. Create Post
    const res = await createPost(title, body, communityId, user.id, imageUrl);

    setLoading(false);

    if (res.error) {
      alert(res.error);
    } else {
      setTitle('');
      setBody('');
      setImageFile(null);
      router.refresh(); 
    }
  };

  if (!user) {
    return (
      <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 shadow-sm flex items-center justify-between text-zinc-500">
        <span>Log in to start posting!</span>
        <button onClick={() => router.push('/auth')} className="text-emerald-500 font-bold hover:underline">Log In</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 shadow-sm space-y-3 transition-colors focus-within:border-zinc-700">
      <div className="flex gap-2 mb-2">
        <select 
          value={communityId}
          onChange={(e) => setCommunityId(e.target.value)}
          className="bg-zinc-950 border border-zinc-700 text-zinc-300 text-xs rounded-full focus:ring-emerald-500 focus:border-emerald-500 block px-3 py-1 outline-none"
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
        className="w-full bg-transparent text-lg font-medium text-white placeholder-zinc-600 focus:outline-none" 
      />
      
      <textarea 
        placeholder="Text (optional)" 
        value={body}
        onChange={(e) => setBody(e.target.value)}
        className="w-full bg-transparent text-sm text-zinc-300 placeholder-zinc-600 focus:outline-none resize-y min-h-[60px]" 
      />

      {/* Image Preview & Input */}
      {imageFile && (
          <div className="relative w-fit">
              <img src={URL.createObjectURL(imageFile)} className="h-20 rounded-md border border-zinc-700" alt="Preview" />
              <button 
                type="button"
                onClick={() => setImageFile(null)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
          </div>
      )}

      <div className="flex justify-between items-center pt-2 border-t border-zinc-800">
        <label className="cursor-pointer text-zinc-500 hover:text-emerald-400 transition-colors flex items-center gap-1 text-sm">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            <span>Add Image</span>
            <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files && setImageFile(e.target.files[0])} />
        </label>

        <button 
          type="submit" 
          disabled={loading}
          className="bg-zinc-100 hover:bg-white text-zinc-900 text-sm font-bold py-1.5 px-4 rounded-full transition-all disabled:opacity-50 hover:shadow-[0_0_15px_rgba(255,255,255,0.2)]"
        >
          {loading ? 'Posting...' : 'Post'}
        </button>
      </div>
    </form>
  );
}
