// src/components/PixelAvatar.tsx
import React from "react";

export function PixelAvatar({ seed, size = 48 }: { seed: string; size?: number }) {
  const src = `/api/avatar/${encodeURIComponent(seed)}`;
  return <img src={src} width={size} height={size} alt="avatar" style={{ borderRadius: 8 }} />;
}
