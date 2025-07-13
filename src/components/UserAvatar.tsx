import { useState } from 'react';
import PixelatedAvatar from './PixelatedAvatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { UserProfile } from './UserProfile';

interface UserAvatarProps {
  username: string;
  size?: number;
  className?: string;
}

export function UserAvatar({ username, size = 40, className }: UserAvatarProps) {
  // Generate consistent seed from username
  const seed = username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className={`rounded-full hover:ring-2 hover:ring-primary transition-all ${className || ''}`}>
          <PixelatedAvatar seed={seed} size={size} />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Profile</DialogTitle>
        </DialogHeader>
        <UserProfile />
      </DialogContent>
    </Dialog>
  );
}
