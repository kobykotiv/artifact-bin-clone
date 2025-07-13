// CommunityFeed.tsx
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
// import type { CommunityPost } from '@/lib/models/Post';
import type { CommunityPost as CommunityPostType } from '@/lib/models/Community';
import { CommunityPost as CommunityPostComponent } from './CommunityPost';

export const CommunityFeed: React.FC = () => {
  const [posts, setPosts] = useState<CommunityPostType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/community/posts')
      .then(res => res.json())
      .then(data => {
        setPosts(data.posts || []);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading community feed...</div>;

  return (
    <div className="space-y-4">
      {posts.length === 0 && <div className="text-center text-gray-400">No community posts yet.</div>}
      {posts.map(post => (
        <CommunityPostComponent key={post.id} post={post} />
      ))}
    </div>
  );
};

export default CommunityFeed;
