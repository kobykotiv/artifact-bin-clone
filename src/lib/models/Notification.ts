// Notification model for Community tab
export interface Notification {
  id: string;
  userId: string;
  type: 'mention' | 'comment' | 'reaction' | 'system';
  message: string;
  postId?: string;
  commentId?: string;
  createdAt: string;
  read: boolean;
}
