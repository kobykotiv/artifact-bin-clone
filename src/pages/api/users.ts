import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  if (req.method === 'GET') {
    // List all users
    const users = await User.find({}, 'id username email avatarUrl createdAt updatedAt').lean();
    return res.status(200).json({ users });
  }
  if (req.method === 'POST') {
    // Create a new user
    const { username, email, avatarUrl } = req.body;
    if (!username) return res.status(400).json({ error: 'username required' });
    const user = await User.create({ username, email, avatarUrl });
    return res.status(201).json({ user });
  }
  if (req.method === 'PUT') {
    // Update a user
    const { id, ...updates } = req.body;
    if (!id) return res.status(400).json({ error: 'id required' });
    const user = await User.findByIdAndUpdate(id, updates, { new: true });
    return res.status(200).json({ user });
  }
  if (req.method === 'DELETE') {
    // Delete a user
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: 'id required' });
    await User.findByIdAndDelete(id);
    return res.status(204).end();
  }
  res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
