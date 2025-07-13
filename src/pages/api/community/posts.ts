// API for Community Posts
import type { NextApiRequest, NextApiResponse } from 'next';
import { communityService } from '@/lib/services/community';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // GET: list posts, filter by author, tag, visibility, etc.
  if (req.method === 'GET') {
    const posts = await communityService.getCommunityPosts();
    return res.status(200).json({ posts });
  }
  // POST: create new post
  if (req.method === 'POST') {
    const post = req.body;
    if (!post.userId && !post.authorId) return res.status(400).json({ error: 'authorId required' });
    // Accept both userId/authorId for compatibility
    const authorId = post.authorId || post.userId;
    const authorName = post.authorName || post.username || 'Unknown';
    const newPost = await communityService.createCommunityPost({ ...post, authorId, authorName });
    return res.status(201).json({ post: newPost });
  }
  // PUT: update post
  if (req.method === 'PUT') {
    const { id, ...updates } = req.body;
    if (!id) return res.status(400).json({ error: 'id required' });
    const updated = await communityService.updateCommunityPost(id, updates);
    return res.status(200).json({ post: updated });
  }
  // DELETE: delete post
  if (req.method === 'DELETE') {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: 'id required' });
    await communityService.deleteCommunityPost(id);
    return res.status(204).end();
  }
  res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
