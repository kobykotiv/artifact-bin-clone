// CommunityExternalFeed.tsx
import React, { useEffect, useState } from 'react';

interface ExternalPost {
  id: string;
  title: string;
  url: string;
  description: string;
  published_at: string;
  tag_list: string[];
  user: { name: string; username: string; profile_image: string };
  source: 'devto' | 'bluesky';
}

const PLATFORMS = [
  { id: 'all', label: 'All' },
  { id: 'devto', label: 'Dev.to' },
  { id: 'bluesky', label: 'Bluesky' },
];

export const CommunityExternalFeed: React.FC = () => {
  const [platform, setPlatform] = useState<'all' | 'devto' | 'bluesky'>('all');
  const [posts, setPosts] = useState<ExternalPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const fetchDevto = async () => {
      const res = await fetch('https://dev.to/api/articles?per_page=10');
      const data = await res.json();
      return data.map((a: any) => ({
        id: a.id.toString(),
        title: a.title,
        url: a.url,
        description: a.description || a.title,
        published_at: a.published_at,
        tag_list: a.tag_list,
        user: {
          name: a.user.name,
          username: a.user.username,
          profile_image: a.user.profile_image,
        },
        source: 'devto',
      }));
    };
    // For demo, only Dev.to. Bluesky can be added similarly.
    fetchDevto()
      .then((devtoPosts) => {
        setPosts(devtoPosts);
        setLoading(false);
      })
      .catch((e) => {
        setError('Failed to fetch external posts');
        setLoading(false);
      });
  }, [platform]);

  return (
    <div className="space-y-4">
      <div className="flex gap-2 mb-2">
        {PLATFORMS.map((p) => (
          <button
            key={p.id}
            className={`px-3 py-1 rounded-full text-sm font-medium border ${platform === p.id ? 'bg-primary text-white' : 'bg-white text-gray-700'}`}
            onClick={() => setPlatform(p.id as any)}
          >
            {p.label}
          </button>
        ))}
      </div>
      {loading && <div className="text-center text-gray-500">Loading external posts...</div>}
      {error && <div className="text-center text-red-500">{error}</div>}
      {posts.map((post) => (
        <a
          key={post.id}
          href={post.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block border rounded-lg p-4 hover:shadow-md transition bg-white"
        >
          <div className="flex items-center gap-3 mb-2">
            <img src={post.user.profile_image} alt={post.user.username} className="w-8 h-8 rounded-full" />
            <div>
              <div className="font-semibold text-base">{post.title}</div>
              <div className="text-xs text-gray-500">by {post.user.name} @{post.user.username}</div>
            </div>
            <span className="ml-auto px-2 py-0.5 rounded bg-gray-100 text-xs font-medium">{post.source === 'devto' ? 'Dev.to' : 'Bluesky'}</span>
          </div>
          <div className="text-sm text-gray-700 mb-2 line-clamp-2">{post.description}</div>
          <div className="flex gap-2 flex-wrap">
            {post.tag_list.map((tag) => (
              <span key={tag} className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs">#{tag}</span>
            ))}
          </div>
        </a>
      ))}
      {posts.length === 0 && !loading && <div className="text-center text-gray-400">No posts found.</div>}
    </div>
  );
};

export default CommunityExternalFeed;
