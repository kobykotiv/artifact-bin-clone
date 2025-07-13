// Post model for Community tab
export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  tags?: string[];
  attachments?: string[];
  mentions?: string[];
  visibility: 'public' | 'team' | 'private';
  version?: number;
  reactions?: Reaction[];
  commentCount?: number;
}
