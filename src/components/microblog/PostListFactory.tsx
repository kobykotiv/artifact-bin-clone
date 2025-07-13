import React from 'react';
import { PostFactory, MicroblogPost } from './PostFactory';

export function PostListFactory({ posts, onEdit, onDelete }: {
  posts: MicroblogPost[];
  onEdit?: (post: MicroblogPost) => void;
  onDelete?: (id: string) => void;
}) {
  if (!posts.length) return <div className="text-gray-400">No posts found.</div>;
  return (
    <div>
      {posts.map(post => (
        <PostFactory key={post._id || post.createdAt} post={post} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  );
}
