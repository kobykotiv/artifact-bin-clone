import mongoose, { Schema, model, Document, Types } from 'mongoose';

// Re-using the interface from db.ts for consistency
export interface FolderData {
  id: string;
  userId: string;
  parentId?: string; // For nested folders
  name: string;
  createdAt: string;
  updatedAt: string;
}

// Mongoose Document Interface
export interface IFolder extends Document {
  userId: Types.ObjectId; // Use ObjectId for Mongoose relations
  parentId?: Types.ObjectId; // Reference to parent folder
  name: string;
  // Timestamps handled by Mongoose
}

const FolderSchema = new Schema<IFolder>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  parentId: { type: Schema.Types.ObjectId, ref: 'Folder', index: true }, // Self-reference for nesting
  name: { type: String, required: true, trim: true },
}, {
  timestamps: true, // Adds createdAt and updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  id: false
});

// Virtual for 'id'
FolderSchema.virtual('id').get(function(this: IFolder) {
  return this._id.toHexString();
});

// Index for efficient querying by user and parent
FolderSchema.index({ userId: 1, parentId: 1 });

const FolderModel = mongoose.models.Folder || model<IFolder>('Folder', FolderSchema);

export default FolderModel;
