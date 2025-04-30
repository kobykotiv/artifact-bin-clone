import mongoose, { Schema, model, Document, Types } from 'mongoose';
import crypto from 'crypto';

// Re-using the interface from db.ts for consistency, but ideally defined centrally
export interface ArtifactData {
  id: string;
  userId: string; // Changed from Types.ObjectId to string for consistency with dbService usage
  folderId?: string;
  projectId?: string;
  name: string;
  content: string; // Represents the code/text content (simulates S3 link/content)
  fileType: string; // e.g., 'js', 'ts', 'json', 'md'
  tags: string[];
  voteRatio?: number;
  createdAt: string;
  updatedAt: string;
  avatarSeed: string; // Added based on existing Artifact interface in db.ts
  language: string; // Added based on existing Artifact interface in db.ts
}

// Mongoose Document Interface
export interface IArtifact extends Document {
  userId: Types.ObjectId; // Use ObjectId for Mongoose relations
  folderId?: Types.ObjectId;
  projectId?: Types.ObjectId;
  name: string;
  content: string; // In a real scenario, this might be an S3 key/URL
  fileType: string;
  tags: string[];
  voteRatio?: number;
  avatarSeed: string;
  language: string; // Ensure language is part of the schema
  // Timestamps are handled by Mongoose option
}

const ArtifactSchema = new Schema<IArtifact>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  folderId: { type: Schema.Types.ObjectId, ref: 'Folder', index: true },
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', index: true },
  name: { type: String, required: true, trim: true },
  content: { type: String, required: true }, // Store content directly for now
  fileType: { type: String, required: true, trim: true },
  language: { type: String, required: true, trim: true }, // Added language field
  tags: { type: [String], default: [] },
  voteRatio: { type: Number },
  avatarSeed: { type: String, default: () => crypto.randomUUID() },
}, {
  timestamps: true, // Adds createdAt and updatedAt automatically
  toJSON: { virtuals: true }, // Ensure virtuals like 'id' are included
  toObject: { virtuals: true },
  id: false // Disable default virtual 'id' if using custom one below (or rely on _id)
});

// Virtual for 'id' to map '_id' if needed consistently elsewhere
ArtifactSchema.virtual('id').get(function(this: IArtifact) {
  return this._id.toHexString();
});

const ArtifactModel = mongoose.models.Artifact || model<IArtifact>('Artifact', ArtifactSchema);

export default ArtifactModel;
