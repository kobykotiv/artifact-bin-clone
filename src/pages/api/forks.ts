import type { NextApiRequest, NextApiResponse } from 'next';
import { dbService } from '@/lib/services/db';

// GET /api/forks?artifactId=xxx - get all forks for an artifact
// POST /api/forks - create a new fork
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { artifactId } = req.query;
    if (!artifactId || typeof artifactId !== 'string') {
      return res.status(400).json({ error: 'artifactId is required' });
    }
    try {
      const forks = await dbService.getForksByArtifact(artifactId);
      return res.status(200).json({ forks });
    } catch (err) {
      return res.status(500).json({ error: 'Failed to fetch forks' });
    }
  }
  if (req.method === 'POST') {
    try {
      const fork = req.body;
      if (!fork || !fork.artifactId || !fork.userId || !fork.title) {
        return res.status(400).json({ error: 'Missing required fork fields' });
      }
      const created = await dbService.createFork(fork);
      return res.status(201).json({ fork: created });
    } catch (err) {
      return res.status(500).json({ error: 'Failed to create fork' });
    }
  }
  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
