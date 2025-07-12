export interface ReviewData {
  id: string;
  artifactId: string;
  userId: string;
  rating: number; // e.g., 1-5
  comment?: string;
  createdAt: string;
  updatedAt: string;
}
