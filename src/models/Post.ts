import mongoose from 'mongoose';

const PostSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  username: { type: String, required: true }, // denormalized for fast lookup
  content: { type: String, required: true },
  tags: [String],
  isPublic: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.models.Post || mongoose.model('Post', PostSchema);
