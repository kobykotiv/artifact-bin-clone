// src/components/CommentSystem.tsx
import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Card, CardContent, CardHeader } from './ui/card';
import { Badge } from './ui/badge';
import { UserAvatar } from './UserAvatar';
import { MessageSquare, Send, Heart, Reply, Flag } from 'lucide-react';

interface Comment {
  id: string;
  userId: string;
  username: string;
  content: string;
  timestamp: string;
  likes: number;
  replies?: Comment[];
  parentId?: string;
}

interface CommentSystemProps {
  artifactId: string;
  open: boolean;
  onClose: () => void;
}

export function CommentSystem({ artifactId, open, onClose }: CommentSystemProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Mock data for demo
  useEffect(() => {
    if (open) {
      // Simulate fetching comments
      const mockComments: Comment[] = [
        {
          id: '1',
          userId: 'user1',
          username: 'developer_pro',
          content: 'This is an amazing implementation! Love the clean code structure.',
          timestamp: '2 hours ago',
          likes: 5,
          replies: [
            {
              id: '2',
              userId: 'user2',
              username: 'react_fan',
              content: 'Agreed! The performance is also really good.',
              timestamp: '1 hour ago',
              likes: 2,
              parentId: '1'
            }
          ]
        },
        {
          id: '3',
          userId: 'user3',
          username: 'code_reviewer',
          content: 'Could you add TypeScript support? Would make it even better!',
          timestamp: '30 minutes ago',
          likes: 3
        }
      ];
      setComments(mockComments);
    }
  }, [open, artifactId]);

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;
    
    setLoading(true);
    try {
      // Mock API call
      const comment: Comment = {
        id: Date.now().toString(),
        userId: 'current-user',
        username: 'you',
        content: newComment,
        timestamp: 'just now',
        likes: 0,
        parentId: replyingTo || undefined
      };

      if (replyingTo) {
        // Add as reply
        setComments(prev => prev.map(c => 
          c.id === replyingTo 
            ? { ...c, replies: [...(c.replies || []), comment] }
            : c
        ));
      } else {
        // Add as top-level comment
        setComments(prev => [comment, ...prev]);
      }

      setNewComment('');
      setReplyingTo(null);
    } catch (error) {
      console.error('Failed to post comment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLikeComment = (commentId: string, isReply = false, parentId?: string) => {
    if (isReply && parentId) {
      setComments(prev => prev.map(c => 
        c.id === parentId 
          ? {
              ...c, 
              replies: c.replies?.map(r => 
                r.id === commentId ? { ...r, likes: r.likes + 1 } : r
              )
            }
          : c
      ));
    } else {
      setComments(prev => prev.map(c => 
        c.id === commentId ? { ...c, likes: c.likes + 1 } : c
      ));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Comments & Discussion
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col gap-4 max-h-96 overflow-y-auto">
          {/* Comment Input */}
          <Card>
            <CardContent className="p-4">
              {replyingTo && (
                <div className="mb-2 text-sm text-muted-foreground">
                  Replying to comment... 
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setReplyingTo(null)}
                    className="ml-2"
                  >
                    Cancel
                  </Button>
                </div>
              )}
              <div className="flex gap-2">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={replyingTo ? "Write a reply..." : "Share your thoughts..."}
                  className="flex-1 border rounded p-2 resize-none"
                  rows={3}
                />
                <Button 
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim() || loading}
                  size="sm"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Comments List */}
          <div className="space-y-4">
            {comments.map((comment) => (
              <Card key={comment.id} className="comment">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <UserAvatar username={comment.username} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{comment.username}</span>
                        <Badge variant="outline" className="text-xs">
                          {comment.timestamp}
                        </Badge>
                      </div>
                      <p className="text-sm mb-2">{comment.content}</p>
                      
                      {/* Comment Actions */}
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleLikeComment(comment.id)}
                          className="text-xs h-6"
                        >
                          <Heart className="w-3 h-3 mr-1" />
                          {comment.likes}
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setReplyingTo(comment.id)}
                          className="text-xs h-6"
                        >
                          <Reply className="w-3 h-3 mr-1" />
                          Reply
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-xs h-6"
                        >
                          <Flag className="w-3 h-3 mr-1" />
                          Report
                        </Button>
                      </div>

                      {/* Replies */}
                      {comment.replies && comment.replies.length > 0 && (
                        <div className="mt-3 ml-4 border-l-2 border-muted pl-4 space-y-3">
                          {comment.replies.map((reply) => (
                            <div key={reply.id} className="flex items-start gap-3">
                              <UserAvatar username={reply.username} />
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-sm">{reply.username}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {reply.timestamp}
                                  </Badge>
                                </div>
                                <p className="text-sm mb-2">{reply.content}</p>
                                <div className="flex items-center gap-2">
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => handleLikeComment(reply.id, true, comment.id)}
                                    className="text-xs h-6"
                                  >
                                    <Heart className="w-3 h-3 mr-1" />
                                    {reply.likes}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {comments.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No comments yet. Be the first to share your thoughts!</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
