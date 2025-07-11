import { useState, useCallback } from 'react';
import { dbService } from '@/lib/services/db';
import { toast } from 'sonner';

export function useFolderOperations(userId: string) {
  const [loading, setLoading] = useState(false);
  
  const createFolder = useCallback(async (name: string, parentId?: string) => {
    if (!userId) return null;
    
    setLoading(true);
    try {
      const newFolder = await dbService.createFolder({
        userId,
        name,
        parentId,
        isShared: false,
        sharedWith: [],
      });
      
      toast.success("Folder created");
      return newFolder;
    } catch (error) {
      console.error("Failed to create folder:", error);
      toast.error("Failed to create folder");
      return null;
    } finally {
      setLoading(false);
    }
  }, [userId]);
  
  const moveArtifacts = useCallback(async (artifactIds: string[], folderId: string) => {
    setLoading(true);
    try {
      const success = await dbService.moveArtifactsToFolder(artifactIds, folderId);
      
      if (success) {
        toast.success(`${artifactIds.length} artifacts moved to folder`);
      } else {
        toast.error("Failed to move artifacts");
      }
      
      return success;
    } catch (error) {
      console.error("Failed to move artifacts:", error);
      toast.error("Failed to move artifacts");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);
  
  const shareFolder = useCallback(async (folderId: string, emails: string[]) => {
    setLoading(true);
    try {
      const sharedWith = await dbService.shareFolderWithUsers(folderId, emails);
      
      if (sharedWith.length > 0) {
        toast.success(`Folder shared with ${sharedWith.length} users`);
      } else {
        toast.warning("No valid users found");
      }
      
      return sharedWith;
    } catch (error) {
      console.error("Failed to share folder:", error);
      toast.error("Failed to share folder");
      return [];
    } finally {
      setLoading(false);
    }
  }, []);
  
  return {
    loading,
    createFolder,
    moveArtifacts,
    shareFolder,
  };
}
