import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/dbConnect';
import Post from '@/models/Post';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  if (req.method === 'GET') {
    // List all posts, optionally filter by userId
    const { userId } = req.query;
    const filter: any = {};
    if (userId) filter.userId = userId;
    const posts = await Post.find(filter).sort({ createdAt: -1 }).lean();
    return res.status(200).json({ posts });
  }
  if (req.method === 'POST') {
    // Create a new post
    const { userId, username, content, tags, isPublic } = req.body;
    if (!userId || !username || !content) return res.status(400).json({ error: 'userId, username, and content required' });
    const post = await Post.create({ userId, username, content, tags, isPublic });
    return res.status(201).json({ post });
  }
  if (req.method === 'PUT') {
    // Update a post
    const { id, content, tags, isPublic } = req.body;
    if (!id) return res.status(400).json({ error: 'id required' });
    const post = await Post.findByIdAndUpdate(id, { content, tags, isPublic, updatedAt: new Date() }, { new: true });
    return res.status(200).json({ post });
  }
  if (req.method === 'DELETE') {
    // Delete a post
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: 'id required' });
    await Post.findByIdAndDelete(id);
    return res.status(204).end();
  }
  res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
