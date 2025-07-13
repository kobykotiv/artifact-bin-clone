import { type CommunityPost, type CommunityStats, type CollaboratorHighlight } from "@/lib/models/Community";
import { type Reaction } from "@/lib/models/Reaction";
import { type Comment } from "@/lib/models/Comment";
import { type Notification } from "@/lib/models/Notification";

class CommunityService {
  private posts: Map<string, CommunityPost> = new Map();
  private stats: CommunityStats = {
    members: 128,
    activeToday: 34,
    trendingTopics: 5,
    posts: 212,
  };
  private collaborators: CollaboratorHighlight[] = [
    { id: '1', name: 'John Smith', avatarSeed: 'john', activityCount: 12, lastActive: '5 minutes ago' },
    { id: '2', name: 'Sarah Chen', avatarSeed: 'sarah', activityCount: 8, lastActive: '1 hour ago' },
    { id: '3', name: 'Mike Johnson', avatarSeed: 'mike', activityCount: 6, lastActive: '2 hours ago' },
    { id: '4', name: 'Lisa Wang', avatarSeed: 'lisa', activityCount: 5, lastActive: '3 hours ago' },
  ];
  private reactions: Map<string, Reaction> = new Map(); // id -> Reaction
  private comments: Map<string, Comment> = new Map(); // id -> Comment
  private notifications: Map<string, Notification> = new Map(); // id -> Notification
  private activity: Array<any> = []; // Array of activity events

  constructor() {
    this.load();
  }

  async getCommunityPosts(): Promise<CommunityPost[]> {
    return Array.from(this.posts.values()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createCommunityPost(post: Omit<CommunityPost, 'id' | 'createdAt' | 'updatedAt'>): Promise<CommunityPost> {
    const now = new Date().toISOString();
    const newPost: CommunityPost = {
      ...post,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
      likes: 0,
      replies: 0,
    };
    this.posts.set(newPost.id, newPost);
    await this.persist();
    this.stats.posts++;
    return newPost;
  }

  async likeCommunityPost(id: string): Promise<CommunityPost | null> {
    const post = this.posts.get(id);
    if (!post) return null;
    post.likes++;
    post.updatedAt = new Date().toISOString();
    this.posts.set(id, post);
    await this.persist();
    return post;
  }

  async getCommunityStats(): Promise<CommunityStats> {
    return this.stats;
  }

  async getCollaboratorHighlights(): Promise<CollaboratorHighlight[]> {
    return this.collaborators;
  }

  // --- REACTIONS ---
  async listReactions({ postId, commentId }: { postId?: string; commentId?: string }): Promise<Reaction[]> {
    return Array.from(this.reactions.values()).filter(r => (postId && r.postId === postId) || (commentId && (r as any).commentId === commentId));
  }
  async addReaction(reaction: Reaction): Promise<Reaction> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const newReaction = { ...reaction, id, createdAt: now };
    this.reactions.set(id, newReaction);
    await this.persist();
    this.activity.push({ type: 'reaction', ...newReaction, timestamp: now });
    return newReaction;
  }
  async removeReaction(id: string): Promise<void> {
    this.reactions.delete(id);
    await this.persist();
  }

  // --- COMMENTS ---
  async listComments({ postId }: { postId: string }): Promise<Comment[]> {
    // Return threaded comments for a post
    const all = Array.from(this.comments.values()).filter(c => c.postId === postId);
    const map = new Map<string, Comment & { thread?: Comment[] }>();
    all.forEach(c => map.set(c.id, { ...c }));
    // Build threads
    all.forEach(c => {
      if (c.parentId && map.has(c.parentId)) {
        const parent = map.get(c.parentId)!;
        if (!parent.thread) parent.thread = [];
        parent.thread.push(map.get(c.id)!);
      }
    });
    // Return only top-level comments
    return Array.from(map.values()).filter(c => !c.parentId);
  }
  async addComment(comment: Comment): Promise<Comment> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const newComment = { ...comment, id, createdAt: now, updatedAt: now };
    this.comments.set(id, newComment);
    await this.persist();
    this.activity.push({ type: 'comment', ...newComment, timestamp: now });
    return newComment;
  }
  async updateComment(id: string, updates: Partial<Comment>): Promise<Comment | null> {
    const comment = this.comments.get(id);
    if (!comment) return null;
    const updated = { ...comment, ...updates, updatedAt: new Date().toISOString() };
    this.comments.set(id, updated);
    await this.persist();
    return updated;
  }
  async deleteComment(id: string): Promise<void> {
    this.comments.delete(id);
    await this.persist();
  }

  // --- NOTIFICATIONS ---
  async listNotifications(userId: string): Promise<Notification[]> {
    return Array.from(this.notifications.values()).filter(n => n.userId === userId);
  }
  async markNotificationRead(id: string): Promise<Notification | null> {
    const n = this.notifications.get(id);
    if (!n) return null;
    const updated = { ...n, read: true };
    this.notifications.set(id, updated);
    await this.persist();
    return updated;
  }
  async addNotification(notification: Notification): Promise<Notification> {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const n = { ...notification, id, createdAt: now, read: false };
    this.notifications.set(id, n);
    await this.persist();
    return n;
  }

  // --- ACTIVITY FEED ---
  async listCommunityActivity({ binId, userId }: { binId?: string; userId?: string }): Promise<any[]> {
    // Filter by bin/project or user if provided
    return this.activity.filter(a => (!binId || a.binId === binId) && (!userId || a.userId === userId)).slice(-100).reverse();
  }

  private async persist() {
    try {
      const data = {
        posts: Array.from(this.posts.entries()),
        stats: this.stats,
        collaborators: this.collaborators,
        reactions: Array.from(this.reactions.entries()),
        comments: Array.from(this.comments.entries()),
        notifications: Array.from(this.notifications.entries()),
        activity: this.activity,
      };
      localStorage.setItem('community', JSON.stringify(data));
    } catch (error) {
      console.error('Error persisting community data:', error);
    }
  }

  private load() {
    try {
      const data = localStorage.getItem('community');
      if (data) {
        const parsed = JSON.parse(data);
        this.posts = new Map(parsed.posts || []);
        this.stats = parsed.stats || this.stats;
        this.collaborators = parsed.collaborators || this.collaborators;
        this.reactions = new Map(parsed.reactions || []);
        this.comments = new Map(parsed.comments || []);
        this.notifications = new Map(parsed.notifications || []);
        this.activity = parsed.activity || [];
      }
    } catch (error) {
      console.error('Failed to load community data', error);
    }
  }
}

export const communityService = new CommunityService();
