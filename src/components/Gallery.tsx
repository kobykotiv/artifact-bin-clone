// src/components/Gallery.tsx
import React, { useEffect, useState } from "react";
import { UserAvatar } from "./UserAvatar";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const FILTERS = ["Trending", "Featured", "New"];

export function Gallery() {
  const [artifacts, setArtifacts] = useState<any[]>([]);
  const [filter, setFilter] = useState("Trending");
  const [shareArtifact, setShareArtifact] = useState<any | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/artifacts?public=true")
      .then((r) => r.json())
      .then(setArtifacts);
  }, []);

  // Helper to update artifact in state
  const updateArtifact = (id: string, changes: Partial<any>) => {
    setArtifacts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...changes } : a))
    );
  };

  // Social action handlers
  const handleSocialAction = async (artifact: any, action: "like" | "star" | "fork") => {
    setLoadingId(artifact.id);
    // Optimistic update
    const key = action === "like" ? "likes" : action === "star" ? "stars" : "forks";
    updateArtifact(artifact.id, { [key]: (artifact[key] || 0) + 1 });
    try {
      const res = await fetch(`/api/artifacts/${artifact.id}/${action}`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${localStorage.getItem("token") || ""}` },
      });
      if (!res.ok) throw new Error("Failed");
      // Optionally update with returned artifact
      const updated = await res.json();
      updateArtifact(artifact.id, updated);
    } catch (e) {
      // Revert on error
      updateArtifact(artifact.id, { [key]: artifact[key] || 0 });
      alert(`Failed to ${action}`);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="gallery p-4">
      <h2 className="text-xl font-bold mb-4">Public Gallery</h2>
      <div className="flex gap-2 mb-4">
        {FILTERS.map((f) => (
          <Button
            key={f}
            variant={filter === f ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(f)}
          >
            {f}
          </Button>
        ))}
      </div>
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        {artifacts.map((artifact) => (
          <div
            key={artifact.id}
            className="artifact-card border rounded-lg p-4 bg-background"
          >
            <div className="flex items-center gap-2 mb-2">
              <span
                onClick={() => (window.location.href = `/user/${artifact.userId}`)}
                style={{ cursor: "pointer" }}
              >
                <UserAvatar username={artifact.userId} />
              </span>
              <span className="font-semibold">{artifact.title}</span>
            </div>
            <div className="mb-2 text-sm text-muted-foreground">
              {artifact.description || artifact.type}
            </div>
            <div className="flex gap-2 mt-2">
              <Button
                size="sm"
                variant="ghost"
                disabled={loadingId === artifact.id}
                onClick={() => handleSocialAction(artifact, "like")}
              >
                👍 {artifact.likes || 0}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                disabled={loadingId === artifact.id}
                onClick={() => handleSocialAction(artifact, "star")}
              >
                ⭐ {artifact.stars || 0}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                disabled={loadingId === artifact.id}
                onClick={() => handleSocialAction(artifact, "fork")}
              >
                🍴 {artifact.forks || 0}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShareArtifact(artifact)}
              >
                🔗 Share
              </Button>
            </div>
          </div>
        ))}
      </div>
      {/* Share Modal */}
      <Dialog open={!!shareArtifact} onOpenChange={() => setShareArtifact(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Artifact</DialogTitle>
          </DialogHeader>
          {shareArtifact && (
            <div className="space-y-2">
              <div className="font-semibold">{shareArtifact.title}</div>
              <div className="text-sm text-muted-foreground">Share this link:</div>
              <div className="bg-muted rounded p-2 select-all break-all">
                {window.location.origin + "/artifact/" + shareArtifact.id}
              </div>
              <Button
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.origin + "/artifact/" + shareArtifact.id);
                  alert("Link copied!");
                }}
              >
                Copy Link
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
