// API for Community Comments
import type { NextApiRequest, NextApiResponse } from 'next';
import { communityService } from '@/lib/services/community';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // GET: list comments for a post (threaded)
  if (req.method === 'GET') {
    const { postId } = req.query;
    const comments = await communityService.listComments({ postId });
    return res.status(200).json({ comments });
  }
  // POST: add comment
  if (req.method === 'POST') {
    const comment = req.body;
    const created = await communityService.addComment(comment);
    return res.status(201).json({ comment: created });
  }
  // PUT: update comment
  if (req.method === 'PUT') {
    const { id, ...updates } = req.body;
    const updated = await communityService.updateComment(id, updates);
    return res.status(200).json({ comment: updated });
  }
  // DELETE: delete comment
  if (req.method === 'DELETE') {
    const { id } = req.body;
    await communityService.deleteComment(id);
    return res.status(204).end();
  }
  res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
