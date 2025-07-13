// CommunityPostComposer.tsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export const CommunityPostComposer: React.FC<{ onPost?: () => void }> = ({ onPost }) => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/community/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, authorId: 'demo', authorName: 'Demo User', visibility: 'public' })
      });
      if (!res.ok) throw new Error('Failed to post');
      setContent('');
      if (onPost) onPost();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4 space-y-2">
      <Textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="Share something with the community... (Markdown supported)"
        rows={3}
        required
      />
      {error && <div className="text-red-500 text-xs">{error}</div>}
      <div className="flex justify-end">
        <Button type="submit" disabled={loading || !content.trim()}>{loading ? 'Posting...' : 'Post'}</Button>
      </div>
    </form>
  );
};

export default CommunityPostComposer;
