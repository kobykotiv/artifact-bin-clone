// API for Community Activity Feed
import type { NextApiRequest, NextApiResponse } from 'next';
import { communityService } from '@/lib/services/community';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // GET: list activity feed (global or by bin/project)
  if (req.method === 'GET') {
    const { binId, userId } = req.query;
    const activity = await communityService.listCommunityActivity({ binId, userId });
    return res.status(200).json({ activity });
  }
  res.setHeader('Allow', ['GET']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
