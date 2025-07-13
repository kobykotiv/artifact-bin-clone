import React from 'react';

export interface MicroblogPost {
  _id?: string;
  userId: string;
  content: string;
  tags?: string[];
  isPublic?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export function PostFactory({ post, onEdit, onDelete }: {
  post: MicroblogPost;
  onEdit?: (post: MicroblogPost) => void;
  onDelete?: (id: string) => void;
}) {
  return (
    <div className="border rounded p-3 mb-3 bg-white shadow-sm">
      <div className="text-sm text-gray-500 mb-1">
        <span>User: {post.userId}</span>
        {post.createdAt && <span className="ml-2">{new Date(post.createdAt).toLocaleString()}</span>}
        {post.tags && post.tags.length > 0 && (
          <span className="ml-2">Tags: {post.tags.map(t => <span key={t} className="bg-blue-100 text-blue-700 px-1 rounded mr-1">{t}</span>)}</span>
        )}
      </div>
      <div className="mb-2 whitespace-pre-line">{post.content}</div>
      <div className="flex gap-2">
        {onEdit && <button className="text-xs text-blue-600 hover:underline" onClick={() => onEdit(post)}>Edit</button>}
        {onDelete && post._id && <button className="text-xs text-red-600 hover:underline" onClick={() => onDelete(post._id!)}>Delete</button>}
      </div>
    </div>
  );
}
