import type { NextApiRequest, NextApiResponse } from 'next';
import mongoose from 'mongoose';

// MongoDB connection (reuse if already connected)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/microblog';
if (!mongoose.connection.readyState) {
  mongoose.connect(MONGODB_URI, { dbName: 'microblog' });
}

// Mongoose Post schema/model
const PostSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  content: { type: String, required: true },
  tags: [String],
  isPublic: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

const Post = mongoose.models.Post || mongoose.model('Post', PostSchema);

// API handler
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // List posts (optionally filter by user, tag, or public)
    const { userId, tag, publicOnly } = req.query;
    const filter: any = {};
    if (userId) filter.userId = userId;
    if (tag) filter.tags = tag;
    if (publicOnly === 'true') filter.isPublic = true;
    const posts = await Post.find(filter).sort({ createdAt: -1 }).lean();
    return res.status(200).json({ posts });
  }
  if (req.method === 'POST') {
    // Create a new post
    const { userId, content, tags, isPublic } = req.body;
    if (!userId || !content) return res.status(400).json({ error: 'userId and content required' });
    const post = await Post.create({ userId, content, tags, isPublic });
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
