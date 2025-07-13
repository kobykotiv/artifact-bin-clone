// Reaction model for Community tab
export interface Reaction {
  id: string;
  postId: string;
  userId: string;
  emoji: string; // e.g. '👍', '❤️', ':custom:'
  createdAt: string;
}
