// API for Community Reactions
import type { NextApiRequest, NextApiResponse } from 'next';
import { communityService } from '@/lib/services/community';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // GET: list reactions for a post or comment
  if (req.method === 'GET') {
    const { postId, commentId } = req.query;
    const reactions = await communityService.listReactions({ postId, commentId });
    return res.status(200).json({ reactions });
  }
  // POST: add reaction
  if (req.method === 'POST') {
    const reaction = req.body;
    const created = await communityService.addReaction(reaction);
    return res.status(201).json({ reaction: created });
  }
  // DELETE: remove reaction
  if (req.method === 'DELETE') {
    const { id } = req.body;
    await communityService.removeReaction(id);
    return res.status(204).end();
  }
  res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
