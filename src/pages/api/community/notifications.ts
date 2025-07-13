// API for Community Notifications
import type { NextApiRequest, NextApiResponse } from 'next';
import { communityService } from '@/lib/services/community';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // GET: list notifications for a user
  if (req.method === 'GET') {
    const { userId } = req.query;
    const notifications = await communityService.listNotifications(userId);
    return res.status(200).json({ notifications });
  }
  // POST: mark notification as read
  if (req.method === 'POST') {
    const { id } = req.body;
    const updated = await communityService.markNotificationRead(id);
    return res.status(200).json({ notification: updated });
  }
  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
