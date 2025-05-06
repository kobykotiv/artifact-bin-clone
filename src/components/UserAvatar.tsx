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
}

export function UserAvatar({ username }: UserAvatarProps) {
  // Generate consistent seed from username
  const seed = username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="rounded-full hover:ring-2 hover:ring-primary transition-all">
          <PixelatedAvatar seed={seed} size={40} />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Profile</DialogTitle>
        </DialogHeader>
        <UserProfile />
      </DialogContent>
    </Dialog>
  );
}
