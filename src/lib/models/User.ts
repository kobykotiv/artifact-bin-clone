// src/lib/models/User.ts

export interface IUser {
  id: string;
  email: string;
  passwordHash: string;
  role: 'user' | 'admin';
  avatarSeed?: string;
  username?: string;
  createdAt?: string;
  updatedAt?: string;
  // Add more fields as needed
}

// Alias for compatibility with dbService
export type UserData = IUser;
