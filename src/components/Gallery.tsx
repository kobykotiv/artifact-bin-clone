// src/components/Gallery.tsx
import React, { useEffect, useState, useRef } from "react";
import { UserAvatar } from "./UserAvatar";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AdvancedSearch, type SearchFilters } from "./AdvancedSearch";
import { LivePreview } from "./LivePreview";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader } from "./ui/card";
import { CommentSystem } from "./CommentSystem";
import { CollaborationWorkspace } from "./CollaborationWorkspace";
import { NotificationCenter, useNotifications } from "./NotificationCenter";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { InstallPrompt } from "./InstallPrompt";
import { 
  Eye, 
  Code2, 
  Users, 
  TrendingUp, 
  Calendar, 
  Filter, 
  Play, 
  Star, 
  Heart, 
  GitFork, 
  Maximize2, 
  X, 
  MessageSquare,
  Bell,
  Palette,
  Download,
  Bookmark,
  Share2,
  MoreVertical,
  Settings
} from "lucide-react";

// Gemini-powered AI modal workflow
function GeminiModal({ open, onClose, onAddArtifact }) {
  const [apiKey, setApiKey] = useState(() => sessionStorage.getItem("geminiApiKey") || "");
  const [step, setStep] = useState(0); // 0: key, 1: prompt, 2: plans, 3: code, 4: review
  const [prompt, setPrompt] = useState("");
  const [madLibProps, setMadLibProps] = useState<{ [k: string]: string }>({});
  const [plans, setPlans] = useState<string[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Mad-lib prop extraction (e.g. {{propName}})
  function extractMadLibs(text: string) {
    const matches = text.match(/\{\{(.*?)\}\}/g) || [];
    return Array.from(new Set(matches.map(m => m.slice(2, -2).trim())));
  }

  // Step 1: Save API key
  function handleSaveKey() {
    if (!apiKey) return setError("API key required");
    sessionStorage.setItem("geminiApiKey", apiKey);
    setError("");
    setStep(1);
  }

  // Step 2: Enhance prompt and get plans
  async function handleGetPlans() {
    setError("");
    setLoading(true);
    try {
      // Substitute mad-lib props
      let finalPrompt = prompt;
      for (const k in madLibProps) {
        // Use replaceAll if available, else fallback
        finalPrompt = finalPrompt.split(`{{${k}}}`).join(madLibProps[k]);
      }
      // Enhance prompt and get plans
      const res = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `You are an expert React developer. Given this prompt, generate 3 different high-level plans for building a React component. Prompt: ${finalPrompt}` }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 512 }
        })
      });
      const data = await res.json();
      if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) throw new Error("No plans returned");
      // Split plans by line or number
      const planText = data.candidates[0].content.parts[0].text;
      const planArr = planText.split(/\n\d+\. /).filter(Boolean).map((p, i) => (i === 0 && planText.startsWith("1. ") ? p : p.replace(/^\d+\. /, "")).trim());
      setPlans(planArr.length ? planArr : [planText]);
      setStep(2);
    } catch (e) {
      setError("Failed to get plans: " + (e.message || e.toString()));
    } finally {
      setLoading(false);
    }
  }

  // Step 3: Generate code from plan
  async function handleGenerateCode() {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Write a complete, production-ready React component in a single file based on this plan. Use functional components, hooks, and TypeScript if possible. Plan: ${selectedPlan}` }] }],
          generationConfig: { temperature: 0.5, maxOutputTokens: 1024 }
        })
      });
      const data = await res.json();
      if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) throw new Error("No code returned");
      setGeneratedCode(data.candidates[0].content.parts[0].text);
      setStep(3);
    } catch (e) {
      setError("Failed to generate code: " + (e.message || e.toString()));
    } finally {
      setLoading(false);
    }
  }

  // Step 4: Add artifact
  function handleAddArtifact() {
    onAddArtifact({
      id: "gemini-" + Date.now(),
      userId: "gemini-user",
      title: prompt.slice(0, 40) + (prompt.length > 40 ? "..." : ""),
      description: selectedPlan,
      type: "code",
      language: "typescript",
      content: generatedCode,
      likes: 0, stars: 0, forks: 0, isPublic: true
    });
    onClose();
    setTimeout(() => {
      setStep(0); setPrompt(""); setPlans([]); setSelectedPlan(""); setGeneratedCode(""); setMadLibProps({});
    }, 500);
  }

  // Modal content by step
  let content;
  if (step === 0) {
    content = (
      <div className="space-y-2">
        <div className="font-semibold">Enter your Gemini API Key</div>
        <input className="w-full border rounded p-2" type="password" value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="Paste your Gemini 2.5 Flash API key" />
        <Button size="sm" onClick={handleSaveKey}>Save Key</Button>
        <div className="text-xs text-muted-foreground">Get a free key at <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline">Google AI Studio</a></div>
      </div>
    );
  } else if (step === 1) {
    const madLibs = extractMadLibs(prompt);
    content = (
      <div className="space-y-2">
        <div className="font-semibold">Describe your React component</div>
        <textarea className="w-full border rounded p-2" rows={3} value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="e.g. A todo list with {{itemType}} and {{theme}}" />
        {madLibs.length > 0 && (
          <div className="space-y-1">
            <div className="text-sm">Fill in mad-lib props:</div>
            {madLibs.map(k => (
              <input key={k} className="w-full border rounded p-2" value={madLibProps[k] || ""} onChange={e => setMadLibProps(m => ({ ...m, [k]: e.target.value }))} placeholder={k} />
            ))}
          </div>
        )}
        <Button size="sm" onClick={handleGetPlans} disabled={!prompt || loading}>{loading ? "Generating..." : "Next: Plans"}</Button>
      </div>
    );
  } else if (step === 2) {
    content = (
      <div className="space-y-2">
        <div className="font-semibold">Select a plan</div>
        <ul className="space-y-1">
          {plans.map((p, i) => (
            <li key={i} className={`border rounded p-2 cursor-pointer ${selectedPlan === p ? 'bg-muted' : ''}`} onClick={() => setSelectedPlan(p)}>{p}</li>
          ))}
        </ul>
        <Button size="sm" onClick={handleGenerateCode} disabled={!selectedPlan || loading}>{loading ? "Generating..." : "Next: Generate Code"}</Button>
      </div>
    );
  } else if (step === 3) {
    content = (
      <div className="space-y-2">
        <div className="font-semibold">Generated React Component</div>
        <textarea className="w-full border rounded p-2 font-mono" rows={10} value={generatedCode} onChange={e => setGeneratedCode(e.target.value)} />
        <Button size="sm" onClick={handleAddArtifact}>Add to Gallery</Button>
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Gemini AI React Generator</DialogTitle>
        </DialogHeader>
        {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
        {content}
      </DialogContent>
    </Dialog>
  );
}

const FILTERS = ["Trending", "Featured", "New"];

// --- Factory-Proxy Pattern for Artifact Features ---
// In-memory (indexdb-style) store for forks and user actions
const artifactStore = {
  forks: {}, // { artifactId: [forks] }
  likes: {},
  stars: {},
  comments: {},
  getForks(artifactId) { return this.forks[artifactId] || []; },
  addFork(artifactId, fork) {
    if (!this.forks[artifactId]) this.forks[artifactId] = [];
    this.forks[artifactId].push(fork);
  },
  like(artifactId, userId) {
    if (!this.likes[artifactId]) this.likes[artifactId] = new Set();
    this.likes[artifactId].add(userId);
  },
  star(artifactId, userId) {
    if (!this.stars[artifactId]) this.stars[artifactId] = new Set();
    this.stars[artifactId].add(userId);
  },
  comment(artifactId, comment) {
    if (!this.comments[artifactId]) this.comments[artifactId] = [];
    this.comments[artifactId].push(comment);
  }
};

// Factory for artifact features
function createArtifactFeatureProxy(artifact, userId) {
  return {
    livePreview: () => {/* TODO: mount preview iframe or sandbox */},
    aiSuggest: async () => {/* TODO: call AI API or local model */},
    fork: () => {
      const fork = { ...artifact, id: artifact.id + '-fork-' + Date.now(), forkedFrom: artifact.id, userId };
      artifactStore.addFork(artifact.id, fork);
      return fork;
    },
    like: () => artifactStore.like(artifact.id, userId),
    star: () => artifactStore.star(artifact.id, userId),
    comment: (text) => artifactStore.comment(artifact.id, { userId, text, date: new Date().toISOString() }),
    getForks: () => artifactStore.getForks(artifact.id),
    getComments: () => artifactStore.comments[artifact.id] || [],
    // ...other features
  };
}

// Enhanced search filters
const SORT_OPTIONS = [
  { value: 'created', label: 'Date Created' },
  { value: 'updated', label: 'Last Updated' },
  { value: 'likes', label: 'Most Liked' },
  { value: 'stars', label: 'Most Starred' },
  { value: 'forks', label: 'Most Forked' },
  { value: 'title', label: 'Title A-Z' }
];

export function Gallery() {
  const [artifacts, setArtifacts] = useState<any[]>([]);
  const [filteredArtifacts, setFilteredArtifacts] = useState<any[]>([]);
  const [filter, setFilter] = useState("Trending");
  const [shareArtifact, setShareArtifact] = useState<any | null>(null);
  const [previewArtifact, setPreviewArtifact] = useState<any | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [showGemini, setShowGemini] = useState(false);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [commentArtifact, setCommentArtifact] = useState<any | null>(null);
  const [collaborateArtifact, setCollaborateArtifact] = useState<any | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showThemes, setShowThemes] = useState(false);
  const [bookmarkedArtifacts, setBookmarkedArtifacts] = useState<Set<string>>(new Set());
  
  // Use notification system
  const { notifications, addNotification } = useNotifications();

  useEffect(() => {
    // Demo artifacts for guests
    const demoArtifacts = [
      {
        id: 'demo-gol',
        userId: 'demo-user',
        title: "React Game of Life",
        description: "A React implementation of Conway's Game of Life.",
        type: 'code',
        language: 'javascript',
        content: String.raw`import React, { useState, useCallback } from 'react';
const SIZE = 20;
function nextGen(grid) {
  return grid.map((row, y) =>
    row.map((cell, x) => {
      let neighbors = 0;
      for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++)
        if (i !== 0 || j !== 0)
          neighbors += grid[y + i]?.[x + j] ? 1 : 0;
      return neighbors === 3 || (cell && neighbors === 2) ? 1 : 0;
    })
  );
}
export default function GameOfLife() {
  const [grid, setGrid] = useState(
    Array.from({ length: SIZE }, () => Array(SIZE).fill(0))
  );
  const toggle = (y, x) => setGrid(g => g.map((r, i) => i === y ? r.map((c, j) => j === x ? 1 - c : c) : r));
  const step = useCallback(() => setGrid(g => nextGen(g)), []);
  return (
    <div>
      <button onClick={step}>Next</button>
      <div style={{ display: 'grid', gridTemplateRows: 'repeat(' + SIZE + ', 20px)' }}>
        {grid.map((row, y) =>
          row.map((cell, x) => (
            <div key={y + '-' + x} onClick={() => toggle(y, x)}
              style={{ width: 20, height: 20, background: cell ? '#222' : '#eee', border: '1px solid #ccc', display: 'inline-block' }} />
          ))
        )}
      </div>
    </div>
  );
}`,
        likes: 12, stars: 7, forks: 3, isPublic: true
      },
      {
        id: 'demo-pong',
        userId: 'demo-user',
        title: 'React Pong',
        description: 'A simple Pong game in React.',
        type: 'code',
        language: 'javascript',
        content: String.raw`import React, { useRef, useEffect, useState } from 'react';
const WIDTH = 400, HEIGHT = 200, PADDLE = 40, BALL = 10;
export default function Pong() {
  const [ball, setBall] = useState({ x: WIDTH/2, y: HEIGHT/2, dx: 2, dy: 2 });
  const [paddle, setPaddle] = useState(HEIGHT/2 - PADDLE/2);
  const requestRef = useRef();
  useEffect(() => {
    const animate = () => {
      setBall(b => {
        let { x, y, dx, dy } = b;
        x += dx; y += dy;
        if (y < 0 || y > HEIGHT - BALL) dy = -dy;
        if (x < 0) dx = -dx;
        if (x > WIDTH - BALL && y > paddle && y < paddle + PADDLE) dx = -dx;
        return { x, y, dx, dy };
      });
      requestRef.current = requestAnimationFrame(animate);
    };
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [paddle]);
  return (
    <svg width={WIDTH} height={HEIGHT} style={{ background: '#222' }}>
      <rect x={WIDTH-10} y={paddle} width={10} height={PADDLE} fill="#fff" />
      <circle cx={ball.x} cy={ball.y} r={BALL} fill="#fff" />
    </svg>
  );
}`,
        likes: 8, stars: 5, forks: 2, isPublic: true
      },
      {
        id: 'demo-tetris',
        userId: 'demo-user',
        title: 'React Tetris',
        description: 'A playable Tetris clone in React.',
        type: 'code',
        language: 'javascript',
        content: String.raw`// Full Tetris implementation omitted for brevity. See https://github.com/chvin/react-tetris for a full demo.
export default function Tetris() {
  return <div style={{ color: '#888', fontStyle: 'italic' }}>Tetris game coming soon! (See GitHub for full code.)</div>;
}`,
        likes: 15, stars: 10, forks: 4, isPublic: true
      },
      {
        id: 'demo-landing-simple',
        userId: 'demo-user',
        title: 'Simple Landing Page',
        description: 'A minimal, responsive landing page in React.',
        type: 'code',
        language: 'javascript',
        content: String.raw`export default function SimpleLanding() {
  return (
    <div style={{ fontFamily: 'sans-serif', textAlign: 'center', padding: 40 }}>
      <h1>Welcome to SimpleSite</h1>
      <p>Build your next project with ease.</p>
      <button style={{ padding: '10px 24px', fontSize: 18, borderRadius: 8, background: '#222', color: '#fff', border: 'none' }}>Get Started</button>
    </div>
  );
}`,
        likes: 6, stars: 3, forks: 1, isPublic: true
      },
      {
        id: 'demo-landing-complex',
        userId: 'demo-user',
        title: 'Complex Landing Page',
        description: 'A feature-rich, animated landing page in React.',
        type: 'code',
        language: 'javascript',
        content: String.raw`export default function ComplexLanding() {
  return (
    <div style={{ fontFamily: 'sans-serif', minHeight: '100vh', background: 'linear-gradient(135deg,#f5f7fa,#c3cfe2)', padding: 40 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>ComplexSite</h1>
        <nav>
          <a href="#features" style={{ margin: '0 12px' }}>Features</a>
          <a href="#pricing" style={{ margin: '0 12px' }}>Pricing</a>
          <a href="#contact" style={{ margin: '0 12px' }}>Contact</a>
        </nav>
      </header>
      <section style={{ marginTop: 60 }}>
        <h2>Next-level SaaS for modern teams</h2>
        <p>All the tools you need, in one place.</p>
        <button style={{ padding: '12px 32px', fontSize: 20, borderRadius: 8, background: '#222', color: '#fff', border: 'none', marginTop: 24 }}>Start Free Trial</button>
      </section>
      <footer style={{ marginTop: 80, color: '#888' }}>© 2025 ComplexSite Inc.</footer>
    </div>
  );
}`,
        likes: 9, stars: 6, forks: 2, isPublic: true
      },
      {
        id: 'demo-calculator',
        userId: 'demo-user',
        title: 'React Calculator',
        description: 'A calculator app built with React.',
        type: 'code',
        language: 'javascript',
        content: String.raw`import React, { useState } from 'react';
export default function Calculator() {
  const [val, setVal] = useState('');
  return (
    <div style={{ maxWidth: 240, margin: '40px auto', background: '#f9f9f9', borderRadius: 8, boxShadow: '0 2px 8px #0001', padding: 24 }}>
      <input value={val} readOnly style={{ width: '100%', fontSize: 24, marginBottom: 12, textAlign: 'right', border: 'none', background: 'none' }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
        {[7,8,9,'/','4',5,6,'*','1',2,3,'-','0','.','=','+'].map(b => (
          <button key={b} style={{ fontSize: 20, padding: 12, borderRadius: 6, border: '1px solid #ccc', background: '#fff' }}
            onClick={() => {
              if (b === '=') try { setVal(eval(val).toString()); } catch { setVal('Err'); }
              else setVal(val + b);
            }}>{b}</button>
        ))}
      </div>
      <button style={{ marginTop: 12, width: '100%', background: '#eee', border: 'none', borderRadius: 6, padding: 10 }} onClick={() => setVal('')}>Clear</button>
    </div>
  );
}`,
        likes: 11, stars: 8, forks: 3, isPublic: true
      }
    ];
    fetch("/api/artifacts?public=true")
      .then((r) => r.json())
      .then(apiArtifacts => setArtifacts([...demoArtifacts, ...apiArtifacts]))
      .catch(() => setArtifacts(demoArtifacts));
  }, []);

  // Helper to update artifact in state
  const updateArtifact = (id: string, changes: Partial<any>) => {
    setArtifacts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...changes } : a))
    );
  };

  // Social action handlers with notifications
  const handleSocialAction = async (artifact: any, action: "like" | "star" | "fork") => {
    setLoadingId(artifact.id);
    // Optimistic update
    const key = action === "like" ? "likes" : action === "star" ? "stars" : "forks";
    updateArtifact(artifact.id, { [key]: (artifact[key] || 0) + 1 });
    
    // Add notification
    addNotification({
      type: action === 'like' ? 'like' : action === 'star' ? 'like' : 'fork',
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} added!`,
      message: `You ${action}d "${artifact.title}"`,
      timestamp: 'just now',
      isRead: false
    });
    
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

  // Bookmark functionality
  const toggleBookmark = (artifactId: string) => {
    setBookmarkedArtifacts(prev => {
      const newBookmarks = new Set(prev);
      if (newBookmarks.has(artifactId)) {
        newBookmarks.delete(artifactId);
        addNotification({
          type: 'system',
          title: 'Bookmark removed',
          message: 'Artifact removed from bookmarks',
          timestamp: 'just now',
          isRead: false
        });
      } else {
        newBookmarks.add(artifactId);
        addNotification({
          type: 'system',
          title: 'Bookmark added',
          message: 'Artifact saved to bookmarks',
          timestamp: 'just now',
          isRead: false
        });
      }
      return newBookmarks;
    });
  };

  // Add artifact from AI
  function handleAddAIComponent(code: string) {
    const newArtifact = {
      id: 'ai-' + Date.now(),
      userId: 'ai-user',
      title: 'AI Generated Component',
      description: 'Generated by Gemini AI',
      type: 'code',
      language: 'javascript',
      content: code,
      likes: 0, stars: 0, forks: 0, isPublic: true
    };
    setArtifacts(prev => [newArtifact, ...prev]);
  }

  // Add artifact from Gemini
  function handleAddGeminiArtifact(artifact) {
    setArtifacts(prev => [artifact, ...prev]);
  }

  return (
    <div className="gallery p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Public Gallery</h2>
        <div className="flex gap-2">
          {/* Notification center */}
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={() => setShowNotifications(true)}
            className="relative"
          >
            <Bell className="w-4 h-4" />
            {notifications.filter(n => !n.isRead).length > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs flex items-center justify-center"
              >
                {notifications.filter(n => !n.isRead).length}
              </Badge>
            )}
          </Button>
          
          {/* Theme switcher */}
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={() => setShowThemes(true)}
          >
            <Palette className="w-4 h-4" />
          </Button>
          
          <Button size="sm" variant="outline" onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}>
            <Filter className="w-4 h-4 mr-1" />
            Advanced Search
          </Button>
          <Button size="sm" variant="default" onClick={() => setShowGemini(true)}>
            + Generate with Gemini
          </Button>
        </div>
      </div>

      {/* Advanced Search */}
      {showAdvancedSearch && (
        <Card className="mb-4">
          <CardContent className="p-4">
            <AdvancedSearch 
              artifacts={artifacts}
              onResultsChange={setFilteredArtifacts}
              placeholder="Search artifacts by name, description, language..."
            />
          </CardContent>
        </Card>
      )}

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
        {(showAdvancedSearch ? filteredArtifacts : artifacts).map((artifact) => (
          <Card key={artifact.id} className="artifact-card">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <span
                  onClick={() => (window.location.href = `/user/${artifact.userId}`)}
                  style={{ cursor: "pointer" }}
                >
                  <UserAvatar username={artifact.userId} />
                </span>
                <div className="flex-1">
                  <h3 className="font-semibold text-sm">{artifact.title}</h3>
                  <Badge variant="outline" className="text-xs">
                    {artifact.language}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {artifact.description || artifact.type}
              </p>
              
              {/* Live Preview */}
              {artifact.language === 'javascript' && (
                <div className="border rounded p-2 bg-muted/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium">Live Preview</span>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => setPreviewArtifact(artifact)}
                    >
                      <Maximize2 className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="h-32 overflow-hidden">
                    <LivePreview 
                      artifact={{
                        ...artifact,
                        content: artifact.content,
                        language: artifact.language
                      }}
                      isVisible={true}
                      className="scale-75 origin-top-left"
                    />
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-1 flex-wrap">
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={loadingId === artifact.id}
                  onClick={() => handleSocialAction(artifact, "like")}
                  className="text-xs"
                >
                  <Heart className="w-3 h-3 mr-1" />
                  {artifact.likes || 0}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={loadingId === artifact.id}
                  onClick={() => handleSocialAction(artifact, "star")}
                  className="text-xs"
                >
                  <Star className="w-3 h-3 mr-1" />
                  {artifact.stars || 0}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={loadingId === artifact.id}
                  onClick={() => handleSocialAction(artifact, "fork")}
                  className="text-xs"
                >
                  <GitFork className="w-3 h-3 mr-1" />
                  {artifact.forks || 0}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShareArtifact(artifact)}
                  className="text-xs"
                >
                  <Share2 className="w-3 h-3 mr-1" />
                  Share
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => toggleBookmark(artifact.id)}
                  className="text-xs"
                >
                  <Bookmark className={`w-3 h-3 mr-1 ${bookmarkedArtifacts.has(artifact.id) ? 'fill-current' : ''}`} />
                  {bookmarkedArtifacts.has(artifact.id) ? 'Saved' : 'Save'}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setCommentArtifact(artifact)}
                  className="text-xs"
                >
                  <MessageSquare className="w-3 h-3 mr-1" />
                  Comment
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setCollaborateArtifact(artifact)}
                  className="text-xs"
                >
                  <Users className="w-3 h-3 mr-1" />
                  Collaborate
                </Button>
                {artifact.language === 'javascript' && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setPreviewArtifact(artifact)}
                    className="text-xs"
                  >
                    <Play className="w-3 h-3 mr-1" />
                    Preview
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
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

      {/* Fullscreen Preview Modal */}
      <Dialog open={!!previewArtifact} onOpenChange={() => setPreviewArtifact(null)}>
        <DialogContent className="max-w-6xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Live Preview: {previewArtifact?.title}</span>
              <Button variant="ghost" size="sm" onClick={() => setPreviewArtifact(null)}>
                <X className="w-4 h-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          {previewArtifact && (
            <div className="h-96 overflow-auto">
              <LivePreview 
                artifact={previewArtifact}
                isVisible={true}
                className="w-full h-full"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Gemini Modal */}
      <GeminiModal open={showGemini} onClose={() => setShowGemini(false)} onAddArtifact={handleAddGeminiArtifact} />

      {/* Comment System */}
      <CommentSystem 
        artifactId={commentArtifact?.id || ""}
        open={!!commentArtifact}
        onClose={() => setCommentArtifact(null)}
      />

      {/* Collaboration Workspace */}
      <CollaborationWorkspace
        artifactId={collaborateArtifact?.id || ""}
        open={!!collaborateArtifact}
        onClose={() => setCollaborateArtifact(null)}
      />

      {/* Notification Center */}
      <NotificationCenter
        open={showNotifications}
        onClose={() => setShowNotifications(false)}
      />

      {/* Theme Switcher */}
      <ThemeSwitcher
        open={showThemes}
        onClose={() => setShowThemes(false)}
      />

      {/* PWA Install Prompt */}
      <InstallPrompt />
    </div>
  );
}
