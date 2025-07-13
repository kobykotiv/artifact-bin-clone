import { openDB } from 'idb';
import type { IDBPDatabase } from 'idb';

export interface Artifact {
  id: string;
  title: string;
  language: string;
  code: string;
  createdAt: string;
  updatedAt: string;
  avatarSeed: string; // Add avatar seed field
  tags?: string[]; // Add tags for compatibility with ArtifactData
}

const DB_NAME = 'artifact-bin';
const DB_VERSION = 1;
const STORE_NAME = 'artifacts';

let dbPromise: Promise<IDBPDatabase> | null = null;

export const initDB = async () => {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, {
            keyPath: 'id',
          });
          store.createIndex('updatedAt', 'updatedAt', { unique: false });
        }
      },
    });
  }
  return dbPromise;
};

export const getAllArtifacts = async (): Promise<Artifact[]> => {
  const db = await initDB();
  return db.getAllFromIndex(STORE_NAME, 'updatedAt').then((artifacts) => {
    return artifacts.reverse();
  });
};

export const getArtifact = async (id: string): Promise<Artifact | undefined> => {
  const db = await initDB();
  return db.get(STORE_NAME, id);
};

export const saveArtifact = async (artifact: Artifact): Promise<string> => {
  const db = await initDB();
  // Ensure avatarSeed exists before saving
  const artifactToSave = {
    ...artifact,
    avatarSeed: artifact.avatarSeed || crypto.randomUUID(), // Generate if missing
  };
  await db.put(STORE_NAME, artifactToSave);
  return artifactToSave.id;
};

export const deleteArtifact = async (id: string): Promise<void> => {
  const db = await initDB();
  await db.delete(STORE_NAME, id);
};

export const getArtifactStats = async (): Promise<{ count: number; size: number }> => {
  const artifacts = await getAllArtifacts();
  
  const count = artifacts.length;
  const size = new TextEncoder().encode(
    artifacts.map(a => JSON.stringify(a)).join('')
  ).length;
  
  return { count, size };
};

// User-related functions for compatibility
export const createUser = async (userData: any): Promise<any> => {
  // This is a placeholder implementation
  // In a real app, this would interact with your user database
  return { id: crypto.randomUUID(), ...userData };
};

export const getUser = async (id: string): Promise<any | null> => {
  // This is a placeholder implementation
  return null;
};

export const getUserByEmail = async (email: string): Promise<any | null> => {
  // This is a placeholder implementation
  return null;
};

export interface IUser {
  id: string;
  email: string;
  // Add other user fields as needed
}

export type { UserData } from './models/User';
