'use client';

import { useState } from 'react';
import CommentForm from './CommentForm';

export default function CommentThread({ comment, commentsMap, postId, path }: { comment: any, commentsMap: Map<string, any[]>, postId: string, path: string }) {
  const [isReplying, setIsReplying] = useState(false);
  
  const replies = commentsMap.get(comment.id) || [];

  return (
    <div className="flex gap-3 group relative">
      {/* Avatar column */}
      <div className="flex flex-col items-center">
          <img src={comment.profiles.avatar_url} className="w-8 h-8 rounded-full bg-zinc-800 z-10" />
          {/* Thread line */}
          {replies.length > 0 && <div className="w-px h-full bg-zinc-800 my-2"></div>}
      </div>

      <div className="flex-1 pb-4">
        {/* Header */}
        <div className="flex items-center gap-2 text-xs text-zinc-500 mb-1">
            <span className="font-bold text-zinc-300">u/{comment.profiles.username}</span>
            <span>•</span>
            <span>{new Date(comment.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
        </div>

        {/* Body */}
        <div className="text-zinc-300 text-sm leading-relaxed mb-2">{comment.body}</div>

        {/* Actions */}
        <div className="flex items-center gap-4">
            <button 
                onClick={() => setIsReplying(!isReplying)}
                className="text-xs font-bold text-zinc-500 hover:text-emerald-400 transition-colors flex items-center gap-1"
            >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
                Reply
            </button>
        </div>

        {/* Reply Form */}
        {isReplying && (
            <CommentForm 
                postId={postId} 
                path={path} 
                parentId={comment.id} 
                onCancel={() => setIsReplying(false)} 
            />
        )}

        {/* Nested Replies */}
        {replies.length > 0 && (
            <div className="mt-4">
                {replies.map((reply) => (
                    <CommentThread 
                        key={reply.id} 
                        comment={reply} 
                        commentsMap={commentsMap} 
                        postId={postId}
                        path={path}
                    />
                ))}
            </div>
        )}
      </div>
    </div>
  );
}
