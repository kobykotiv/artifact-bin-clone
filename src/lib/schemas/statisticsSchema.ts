import { z } from "zod";

// Basic schema for user statistics
export const userStatsSchema = z.object({
  id: z.string().optional(),
  userId: z.string(),
  totalArtifacts: z.number().int().nonnegative(),
  totalFolders: z.number().int().nonnegative(),
  lastActivity: z.string().datetime().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// Schema for artifact usage stats
export const artifactStatsSchema = z.object({
  totalCount: z.number().int().nonnegative(),
  byLanguage: z.record(z.string(), z.number().int().nonnegative()),
  byFolder: z.record(z.string(), z.number().int().nonnegative()),
  averageSize: z.number().nonnegative(),
  totalSize: z.number().nonnegative(),
});

// Schema for storage metrics
export const storageStatsSchema = z.object({
  used: z.number().nonnegative(),
  limit: z.number().nonnegative(),
  percentUsed: z.number().min(0).max(100),
});

// Schema for user activity metrics
export const activityStatsSchema = z.object({
  daily: z.record(z.string(), z.number().int().nonnegative()),
  weekly: z.record(z.string(), z.number().int().nonnegative()),
  monthly: z.record(z.string(), z.number().int().nonnegative()),
});

// Combined statistics schema
export const statisticsSchema = z.object({
  user: userStatsSchema,
  artifacts: artifactStatsSchema,
  storage: storageStatsSchema,
  activity: activityStatsSchema,
});

export type UserStats = z.infer<typeof userStatsSchema>;
export type ArtifactStats = z.infer<typeof artifactStatsSchema>;
export type StorageStats = z.infer<typeof storageStatsSchema>;
export type ActivityStats = z.infer<typeof activityStatsSchema>;
export type Statistics = z.infer<typeof statisticsSchema>;
