'use client';

import { declareCandidacy } from '@/app/actions';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function DeclareCandidacyForm({ electionId, communityName }: { electionId: string, communityName: string }) {
  const [manifesto, setManifesto] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        alert('Please log in first.');
        setLoading(false);
        return;
    }

    const res = await declareCandidacy(electionId, session.user.id, manifesto, communityName);
    setLoading(false);

    if (res.error) {
      alert(res.error);
    } else {
      setShowForm(false);
    }
  };

  if (!showForm) {
      return (
          <button 
            onClick={() => setShowForm(true)}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md shadow-sm"
          >
              ✋ Run for Office
          </button>
      );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-md border border-gray-200 shadow-sm space-y-3 mt-4">
        <h4 className="font-bold text-gray-900">Declare Candidacy</h4>
        <p className="text-sm text-gray-500">Why should you be a moderator? (Be convincing!)</p>
        <textarea 
            required
            value={manifesto}
            onChange={(e) => setManifesto(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2 text-sm"
            rows={3}
        />
        <div className="flex gap-2 justify-end">
            <button 
                type="button" 
                onClick={() => setShowForm(false)}
                className="text-gray-500 hover:text-gray-700 text-sm font-medium"
            >
                Cancel
            </button>
            <button 
                type="submit" 
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 text-white text-sm font-bold py-1 px-3 rounded-md"
            >
                {loading ? 'Submitting...' : 'Submit'}
            </button>
        </div>
    </form>
  );
}
