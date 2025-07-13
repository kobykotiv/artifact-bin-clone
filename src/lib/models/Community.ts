// filepath: /src/lib/models/Community.ts

export interface CommunityPost {
  id: string;
  userId: string;
  username: string;
  avatarSeed?: string;
  content: string;
  type: 'discussion' | 'collaboration' | 'share' | 'invite' | 'trending';
  createdAt: string;
  updatedAt: string;
  likes: number;
  replies: number;
}

export interface CommunityStats {
  members: number;
  activeToday: number;
  trendingTopics: number;
  posts: number;
}

export interface CollaboratorHighlight {
  id: string;
  name: string;
  avatarSeed?: string;
  activityCount: number;
  lastActive: string;
}
