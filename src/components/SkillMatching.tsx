import React from 'react';
import { type UserData } from '@/lib/models/User'; // Adjust path as needed
import { CardTitle } from '@/components/ui/card';

interface SkillMatchingProps {
  user: UserData;
  onConnect: (targetUserId: string) => void;
}

export function SkillMatching({ user, onConnect }: SkillMatchingProps) {
  // Placeholder implementation
  return (
    <div>
      <CardTitle className="mb-4">Skill Matching (Placeholder)</CardTitle>
      <p className="text-muted-foreground">
        This feature will help you find collaborators based on skills. User ID: {user.id}
      </p>
      {/* Add a dummy button to test onConnect */}
      <button onClick={() => onConnect('dummy-target-user-id')} className="mt-2 p-2 bg-blue-500 text-white rounded">
        Test Connect
      </button>
    </div>
  );
}
