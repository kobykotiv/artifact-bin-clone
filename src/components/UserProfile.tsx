import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { type IUser, type UserData, createUser, getUser, getUserByEmail } from "@/lib/db";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { KnowledgeGraph } from "@/components/KnowledgeGraph";
import { SkillMatching } from "@/components/SkillMatching";
import { authService } from "@/lib/services/auth";
import { getRandomItem } from '@/lib/utils';

interface UserProfileProps {
  userId?: string;
  onUserChange?: (user: IUser) => void;
  isGuest?: boolean;
}

export function UserProfile({ userId, onUserChange, isGuest }: UserProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState<IUser | null>(null);
  const [formData, setFormData] = useState<Partial<Omit<UserData, 'id' | 'createdAt' | 'updatedAt'>>>({
    username: "",
    email: "",
    role: "viewer",
    skills: [],
    interests: [],
    preferredLLMs: [],
    avatarSeed: crypto.randomUUID(),
    promptEngineering: {
      totalPrompts: 0,
      successfulPrompts: 0,
      challengesWon: 0,
      reputation: 0
    },
    contributions: {
      totalContributions: 0,
      artifacts: 0,
      codeReviews: 0,
      documentation: 0,
      promptEngineering: 0
    },
    knowledgeGraph: {
      nodes: [],
      edges: []
    }
  });
  const [newSkill, setNewSkill] = useState("");
  const [newInterest, setNewInterest] = useState("");

  useEffect(() => {
    const loadUser = async () => {
      let currentUserId = userId;
      if (!currentUserId) {
        const authState = authService.getAuthState();
        if (authState.isAuthenticated && authState.user) {
          currentUserId = authState.user.id;
        }
      }

      if (currentUserId && !currentUserId.startsWith('guest-')) {
        try {
          const userData = await getUser(currentUserId);
          if (userData) {
            setUser(userData);
            setFormData({
              username: userData.username || '',
              email: userData.email || '',
              role: userData.role,
              skills: userData.skills || [],
              interests: userData.interests || [],
              preferredLLMs: userData.preferredLLMs || [],
              avatarSeed: userData.avatarSeed,
              promptEngineering: userData.promptEngineering || { totalPrompts: 0, successfulPrompts: 0, challengesWon: 0, reputation: 0 },
              contributions: userData.contributions || { totalContributions: 0, artifacts: 0, codeReviews: 0, documentation: 0, promptEngineering: 0 },
              knowledgeGraph: userData.knowledgeGraph || { nodes: [], edges: [] }
            });
          } else {
            setUser(null);
          }
        } catch (error) {
          console.error("Failed to load user:", error);
          toast.error("Failed to load user profile");
        }
      } else if (isGuest) {
        const authState = authService.getAuthState();
        if (authState.user && authState.isGuest) {
          setUser(authState.user as any);
          setFormData({ ...formData, username: authState.user.username, email: authState.user.email, avatarSeed: authState.user.avatarSeed });
        }
        setIsEditing(false);
      }
    };
    loadUser();
  }, [userId, isGuest]);

  const handleCreateOrUpdateUser = async () => {
    if (isGuest) {
      toast.info("Guest users cannot save profiles. Please register.");
      return;
    }
    try {
      if (!isGuest && (!formData.username?.trim() || !formData.email?.trim())) {
        toast.error("Username and email are required");
        return;
      }

      if (!isGuest && formData.email && (!userId || user?.email !== formData.email)) {
        const existingUser = await getUserByEmail(formData.email);
        if (existingUser && existingUser.id !== userId) {
          toast.error("Email is already in use");
          return;
        }
      }

      const userToSave: UserData = {
        id: userId || crypto.randomUUID(),
        createdAt: user?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        username: formData.username || '',
        email: formData.email || '',
        role: formData.role || 'viewer',
        skills: formData.skills || [],
        interests: formData.interests || [],
        preferredLLMs: formData.preferredLLMs || [],
        avatarSeed: formData.avatarSeed || crypto.randomUUID(),
        promptEngineering: formData.promptEngineering,
        contributions: formData.contributions,
        knowledgeGraph: formData.knowledgeGraph,
        isAnonymous: !!isGuest
      };

      const result = await createUser(userToSave);
      if (result) {
        setUser(result);
        setIsEditing(false);
        toast.success(userId ? "Profile updated successfully" : "Profile created successfully");
        onUserChange?.(result);
      } else {
        toast.error("Failed to save profile");
      }
    } catch (error) {
      console.error("Failed to save user:", error);
      toast.error("Failed to save profile");
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !(formData.skills ?? []).includes(newSkill.trim())) { // Use nullish coalescing
      setFormData({
        ...formData,
        skills: [...(formData.skills ?? []), newSkill.trim()] // Use nullish coalescing
      });
      setNewSkill("");
    }
  };

  const removeSkill = (skill: string) => {
    setFormData({
      ...formData,
      skills: formData.skills?.filter(s => s !== skill)
    });
  };

  const addInterest = () => {
    if (newInterest.trim() && !(formData.interests ?? []).includes(newInterest.trim())) { // Use nullish coalescing
      setFormData({
        ...formData,
        interests: [...(formData.interests ?? []), newInterest.trim()] // Use nullish coalescing
      });
      setNewInterest("");
    }
  };

  const removeInterest = (interest: string) => {
    setFormData({
      ...formData,
      interests: formData.interests?.filter(i => i !== interest)
    });
  };

  const getAvatarUrl = (seed: string) => {
    return `https://api.dicebear.com/7.x/personas/svg?seed=${seed}`;
  };

  const handleRegisterGuest = async () => {
    if (!user || !isGuest) return;
    try {
        const email = prompt("Please enter your email to register:");
        if (!email) {
            toast.info("Registration cancelled.");
            return;
        }

        toast.loading("Registering account...");
        const registeredUser = await authService.registerGuest(user.id, { email });

        if (registeredUser) {
            toast.dismiss();
            toast.success("Account registered successfully! You are now logged in.");
        } else {
            toast.dismiss();
            toast.error("Registration failed. Please try again.");
        }
    } catch (error) {
        toast.dismiss();
        console.error("Registration failed:", error);
        toast.error(`Registration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-start gap-6">
          {user && (
            <div className="flex-shrink-0">
              <Avatar className="h-20 w-20 rounded-full">
                <AvatarImage
                  src={getAvatarUrl(user.avatarSeed)}
                  alt={user.username || 'User Avatar'} // Add fallback alt text
                  className="h-20 w-20 rounded-full"
                />
                <AvatarFallback className="h-20 w-20 rounded-full bg-muted flex items-center justify-center text-2xl uppercase">
                  {user.username ? user.username.slice(0, 2) : '??'} {/* Check if username exists */} 
                </AvatarFallback>
              </Avatar>
            </div>
          )}

          <div className="flex-grow">
            {isEditing && !isGuest ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="Enter username"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter email"
                  />
                </div>

                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value: UserData["role"]) =>
                      setFormData({ ...formData, role: value })
                    }
                  >
                    <option value="admin">Admin</option>
                    <option value="editor">Editor</option>
                    <option value="viewer">Viewer</option>
                    <option value="external">External</option>
                  </Select>
                </div>

                <div>
                  <Label>Skills</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      placeholder="Add a skill"
                      onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                    />
                    <Button onClick={addSkill} type="button">Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.skills?.map((skill) => (
                      <Badge key={skill} variant="secondary" className="gap-2">
                        {skill}
                        <button
                          onClick={() => removeSkill(skill)}
                          className="ml-1 text-xs hover:text-destructive"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Interests</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={newInterest}
                      onChange={(e) => setNewInterest(e.target.value)}
                      placeholder="Add an interest"
                      onKeyPress={(e) => e.key === 'Enter' && addInterest()}
                    />
                    <Button onClick={addInterest} type="button">Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.interests?.map((interest) => (
                      <Badge key={interest} variant="secondary" className="gap-2">
                        {interest}
                        <button
                          onClick={() => removeInterest(interest)}
                          className="ml-1 text-xs hover:text-destructive"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateOrUpdateUser}>
                    {userId ? "Update Profile" : "Create Profile"}
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                {user ? (
                  <>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h2 className="text-2xl font-bold">{user.username || 'Guest'}</h2>
                        {user.email && <p className="text-muted-foreground">{user.email}</p>}
                        <p className="text-sm text-muted-foreground mt-1 capitalize">
                          {isGuest ? 'Guest Account' : `${user.role} account`}
                        </p>
                      </div>
                      {!isGuest && (
                         <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
                      )}
                      {isGuest && (
                         <Button onClick={handleRegisterGuest}>Register</Button>
                      )}
                    </div>

                    <div className="grid gap-4">
                      {!isGuest && (
                        <>
                          <div className="space-y-2">
                            <h3 className="font-medium">Skills</h3>
                            <div className="flex flex-wrap gap-2">
                              {user.skills?.map((skill) => (
                                <Badge key={skill} variant="secondary">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <h3 className="font-medium">Interests</h3>
                            <div className="flex flex-wrap gap-2">
                              {user.interests?.map((interest) => (
                                <Badge key={interest} variant="secondary">
                                  {interest}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h3 className="font-medium mb-2">Contribution Stats</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div className="bg-muted p-3 rounded-lg">
                                <div className="text-2xl font-bold">
                                  {user.contributions?.totalContributions || 0}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  Total Contributions
                                </div>
                              </div>
                              <div className="bg-muted p-3 rounded-lg">
                                <div className="text-2xl font-bold">
                                  {user.contributions?.artifacts || 0}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  Artifacts Created
                                </div>
                              </div>
                              <div className="bg-muted p-3 rounded-lg">
                                <div className="text-2xl font-bold">
                                  {user.contributions?.codeReviews || 0}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  Code Reviews
                                </div>
                              </div>
                              <div className="bg-muted p-3 rounded-lg">
                                <div className="text-2xl font-bold">
                                  {user.contributions?.documentation || 0}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  Docs Contributed
                                </div>
                              </div>
                            </div>
                          </div>

                          <div>
                            <h3 className="font-medium mb-2">Prompt Engineering</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div className="bg-muted p-3 rounded-lg">
                                <div className="text-2xl font-bold">
                                  {user.promptEngineering?.totalPrompts || 0}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  Total Prompts
                                </div>
                              </div>
                              <div className="bg-muted p-3 rounded-lg">
                                <div className="text-2xl font-bold">
                                  {user.promptEngineering?.successfulPrompts || 0}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  Successful Prompts
                                </div>
                              </div>
                              <div className="bg-muted p-3 rounded-lg">
                                <div className="text-2xl font-bold">
                                  {user.promptEngineering?.challengesWon || 0}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  Challenges Won
                                </div>
                              </div>
                              <div className="bg-muted p-3 rounded-lg">
                                <div className="text-2xl font-bold">
                                  {user.promptEngineering?.reputation || 0}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  Reputation
                                </div>
                              </div>
                            </div>
                          </div>
                        </>
                      )}

                      <div className="text-sm text-muted-foreground">
                        {user.createdAt && <p>Member since {new Date(user.createdAt).toLocaleDateString()}</p>}
                        {user.updatedAt && <p>Last updated {new Date(user.updatedAt).toLocaleDateString()}</p>}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <h2 className="text-lg font-medium mb-2">Loading Profile...</h2>
                    <p className="text-muted-foreground mb-4">
                      {isGuest ? "Displaying guest information." : "Create a profile or log in."}
                    </p>
                    {!isGuest && <Button onClick={() => setIsEditing(true)}>Create Profile</Button>}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </Card>

      {user && !isGuest && (
        <>
          <Card className="p-6">
            <KnowledgeGraph user={user} />
          </Card>

          <Card className="p-6">
            <SkillMatching 
              user={user} 
              onConnect={(targetUserId) => {
                toast.success(`Connection request sent to user ${targetUserId}`);
              }} 
            />
          </Card>
        </>
      )}
    </div>
  );
}
