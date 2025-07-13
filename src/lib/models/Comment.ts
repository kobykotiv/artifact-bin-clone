// Comment model for Community tab
export interface Comment {
  id: string;
  postId: string;
  parentId?: string; // for threads
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  reactions?: Reaction[];
  thread?: Comment[];
}
import type { Reaction } from './Reaction';
