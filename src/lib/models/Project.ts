import mongoose, { Schema, model, Document, Types } from 'mongoose';

// Re-using the interface from db.ts for consistency
export interface ProjectData {
  id: string;
  userId: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// Mongoose Document Interface
export interface IProject extends Document {
  userId: Types.ObjectId; // Use ObjectId for Mongoose relations
  name: string;
  description?: string;
  // Timestamps handled by Mongoose
}

const ProjectSchema = new Schema<IProject>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
}, {
  timestamps: true, // Adds createdAt and updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  id: false
});

// Virtual for 'id'
ProjectSchema.virtual('id').get(function(this: IProject) {
  return this._id.toHexString();
});

const ProjectModel = mongoose.models.Project || model<IProject>('Project', ProjectSchema);

export default ProjectModel;
