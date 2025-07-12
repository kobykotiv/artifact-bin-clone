// src/components/Gallery.tsx
import React, { useEffect, useState, useRef } from "react";
import { UserAvatar } from "./UserAvatar";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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

// Gemini AI Modal and helpers
function GeminiAIModal({ open, onClose, onComponentGenerated }) {
  const [step, setStep] = useState(0); // 0: prompt, 1: plan, 2: choose, 3: result
  const [apiKey, setApiKey] = useState(() => sessionStorage.getItem("geminiApiKey") || "");
  const [prompt, setPrompt] = useState("");
  const [madLibs, setMadLibs] = useState<{ [k: string]: string }>({});
  const [plans, setPlans] = useState<string[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const promptInput = useRef(null);

  // Mad-lib style: extract {{prop}} from prompt
  function extractMadLibs(text: string) {
    const matches = text.match(/\{\{(.*?)\}\}/g) || [];
    return matches.map(m => m.slice(2, -2));
  }

  // Step 1: Enhance prompt (plan)
  async function handlePlan() {
    setLoading(true);
    // Replace mad-libs in prompt
    let finalPrompt = prompt;
    for (const k of Object.keys(madLibs)) {
      finalPrompt = finalPrompt.replaceAll(`{{${k}}}`, madLibs[k]);
    }
    // Call Gemini to generate plans
    const res = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + apiKey, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: `Given this prompt: '${finalPrompt}', generate 3 different high-level plans for how to build a React component that fulfills the request. Each plan should be a short paragraph.` }] }],
        generationConfig: { temperature: 0.6, candidateCount: 3 }
      })
    });
    const data = await res.json();
    const planTexts = (data.candidates || []).map((c: any) => c.content?.parts?.[0]?.text || "");
    setPlans(planTexts);
    setStep(1);
    setLoading(false);
  }

  // Step 2: Execute plan
  async function handleExecute() {
    setLoading(true);
    // Call Gemini to generate code from plan
    const res = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + apiKey, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: `Plan: ${selectedPlan}\n\nWrite a complete, functional React component (with props if needed) that implements this plan. Output only the code, no explanation.` }] }],
        generationConfig: { temperature: 0.4, candidateCount: 1 }
      })
    });
    const data = await res.json();
    const code = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    setResult(code);
    setStep(2);
    setLoading(false);
  }

  function handlePromptSubmit(e) {
    e.preventDefault();
    // Save API key
    sessionStorage.setItem("geminiApiKey", apiKey);
    // Extract mad-libs
    const props = extractMadLibs(prompt);
    if (props.length > 0) {
      setMadLibs(Object.fromEntries(props.map(p => [p, ""])));
      setStep(-1); // mad-lib fill step
    } else {
      handlePlan();
    }
  }

  function handleMadLibSubmit(e) {
    e.preventDefault();
    handlePlan();
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent style={{ minWidth: 400 }}>
        <DialogHeader>
          <DialogTitle>Gemini AI: Build React Component</DialogTitle>
        </DialogHeader>
        {step === 0 && (
          <form onSubmit={handlePromptSubmit} className="space-y-3">
            <div>
              <label className="block text-sm font-medium">Gemini 2.5 Flash API Key</label>
              <input type="password" value={apiKey} onChange={e => setApiKey(e.target.value)} className="w-full border rounded p-2" required />
              <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600">Get a free API key</a>
            </div>
            <div>
              <label className="block text-sm font-medium">Describe your component (use <code>{'{{prop}}'}</code> for mad-libs)</label>
              <textarea ref={promptInput} value={prompt} onChange={e => setPrompt(e.target.value)} className="w-full border rounded p-2" rows={3} required placeholder="e.g. A button that says '{{label}}' and calls '{{onClick}}' when clicked" />
            </div>
            <Button type="submit" disabled={loading}>Next</Button>
          </form>
        )}
        {step === -1 && (
          <form onSubmit={handleMadLibSubmit} className="space-y-3">
            <div className="text-sm">Fill in the blanks:</div>
            {Object.keys(madLibs).map(k => (
              <div key={k}>
                <label className="block text-xs">{k}</label>
                <input className="w-full border rounded p-2" value={madLibs[k]} onChange={e => setMadLibs(m => ({ ...m, [k]: e.target.value }))} required />
              </div>
            ))}
            <Button type="submit" disabled={loading}>Continue</Button>
          </form>
        )}
        {step === 1 && (
          <div>
            <div className="mb-2 text-sm">Choose a plan:</div>
            <ul className="space-y-2">
              {plans.map((plan, i) => (
                <li key={i} className={`border rounded p-2 cursor-pointer ${selectedPlan === plan ? 'bg-blue-100' : ''}`} onClick={() => setSelectedPlan(plan)}>{plan}</li>
              ))}
            </ul>
            <Button className="mt-3" disabled={!selectedPlan || loading} onClick={handleExecute}>Generate Component</Button>
          </div>
        )}
        {step === 2 && (
          <div>
            <div className="mb-2 text-sm">Generated React Component:</div>
            <pre className="bg-muted rounded p-2 overflow-x-auto text-xs max-h-64" style={{ whiteSpace: 'pre-wrap' }}>{result}</pre>
            <div className="flex gap-2 mt-2">
              <Button size="sm" onClick={() => { navigator.clipboard.writeText(result); }}>Copy Code</Button>
              <Button size="sm" onClick={() => { onComponentGenerated(result); onClose(); }}>Add to Gallery</Button>
            </div>
          </div>
        )}
        {loading && <div className="text-xs text-muted-foreground mt-2">Loading...</div>}
      </DialogContent>
    </Dialog>
  );
}

export function Gallery() {
  const [artifacts, setArtifacts] = useState<any[]>([]);
  const [filter, setFilter] = useState("Trending");
  const [shareArtifact, setShareArtifact] = useState<any | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [showGemini, setShowGemini] = useState(false);

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

  return (
    <div className="gallery p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Public Gallery</h2>
        <Button size="sm" variant="default" onClick={() => setShowGemini(true)}>
          ✨ Build with AI
        </Button>
      </div>
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
      <GeminiAIModal open={showGemini} onClose={() => setShowGemini(false)} onComponentGenerated={handleAddAIComponent} />
    </div>
  );
}
