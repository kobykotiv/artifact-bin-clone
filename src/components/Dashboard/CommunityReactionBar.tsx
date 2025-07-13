// CommunityReactionBar.tsx
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

const EMOJIS = ['👍', '❤️', '😂', '🎉', '😮', '😢'];

export const CommunityReactionBar: React.FC<{ postId: string }> = ({ postId }) => {
  const [reactions, setReactions] = useState<{ [emoji: string]: number }>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/community/reactions?postId=${postId}`)
      .then(res => res.json())
      .then(data => {
        const counts: { [emoji: string]: number } = {};
        (data.reactions || []).forEach((r: any) => {
          counts[r.emoji] = (counts[r.emoji] || 0) + 1;
        });
        setReactions(counts);
      });
  }, [postId]);

  const handleReact = async (emoji: string) => {
    setLoading(true);
    await fetch('/api/community/reactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postId, userId: 'demo', emoji })
    });
    setLoading(false);
    // Refresh
    fetch(`/api/community/reactions?postId=${postId}`)
      .then(res => res.json())
      .then(data => {
        const counts: { [emoji: string]: number } = {};
        (data.reactions || []).forEach((r: any) => {
          counts[r.emoji] = (counts[r.emoji] || 0) + 1;
        });
        setReactions(counts);
      });
  };

  return (
    <div className="flex gap-2 mt-2">
      {EMOJIS.map(emoji => (
        <Button
          key={emoji}
          size="sm"
          variant="ghost"
          disabled={loading}
          onClick={() => handleReact(emoji)}
        >
          <span className="text-lg">{emoji}</span>
          <span className="ml-1 text-xs">{reactions[emoji] || 0}</span>
        </Button>
      ))}
    </div>
  );
};

export default CommunityReactionBar;
