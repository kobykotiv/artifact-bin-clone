// CommunityPost.tsx
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CommunityPost as CommunityPostType } from '@/lib/models/Community';
import { CommunityReactionBar } from './CommunityReactionBar';

export const CommunityPost: React.FC<{ post: CommunityPostType }> = ({ post }) => {
  return (
    <Card className="w-full">
      <CardContent className="py-4 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold">
            {post.username?.[0] || 'U'}
          </div>
          <div>
            <span className="font-medium">{post.username}</span>
            <span className="ml-2 text-xs text-muted-foreground">{new Date(post.createdAt).toLocaleString()}</span>
          </div>
        </div>
        <div className="prose prose-sm max-w-none">{post.content}</div>
        <CommunityReactionBar postId={post.id} />
      </CardContent>
    </Card>
  );
};

export default CommunityPost;
