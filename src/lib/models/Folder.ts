import mongoose, { Schema, model, Document, Types } from 'mongoose';
import crypto from 'crypto';

export interface IFolder extends Document {
  userId: Types.ObjectId;
  name: string;
  description?: string;
  isPublic: boolean;
  sharedWith: Types.ObjectId[];
  parentFolderId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Folder data interface for frontend use
export interface FolderData {
  id: string;
  userId: string;
  name: string;
  description?: string;
  isPublic: boolean;
  sharedWith: string[];
  parentFolderId?: string;
  createdAt: string;
  updatedAt: string;
}

const FolderSchema = new Schema<IFolder>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    isPublic: { type: Boolean, default: false },
    sharedWith: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    parentFolderId: { type: Schema.Types.ObjectId, ref: 'Folder', index: true },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    id: false,
  }
);

// Virtual for 'id' to map '_id'
FolderSchema.virtual('id').get(function(this: IFolder) {
  return this._id.toHexString();
});

const FolderModel = mongoose.models.Folder || model<IFolder>('Folder', FolderSchema);

export default FolderModel;
