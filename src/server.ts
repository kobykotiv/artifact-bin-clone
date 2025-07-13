// src/server.ts
// Bun server with user auth, public gallery API, and pixel avatar endpoint
import { serve } from "bun";
import crypto from "crypto";
import type { ServerWebSocket } from "bun";

// --- In-memory data stores ---
const users: any[] = [
  { id: 'admin', email: 'admin@example.com', passwordHash: hashPassword('admin123'), role: 'admin', avatarSeed: 'admin' }
];
const artifacts: any[] = [];

// --- Helper functions ---
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function getAuth(req: Request) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) return { status: 'guest' };
  
  const token = authHeader.replace('Bearer ', '');
  const user = users.find(u => u.id === token);
  
  if (user) {
    return { status: user.role, user };
  }
  
  return { status: 'guest' };
}

function generatePixelAvatar(seed: string): string {
  // Simple pixel avatar generator
  const hash = crypto.createHash('md5').update(seed).digest('hex');
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#A29BFE', '#FD79A8', '#FDCB6E'];
  const size = 8;
  
  let svg = `<svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">`;
  
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size / 2; j++) {
      const index = (i * size / 2 + j) % hash.length;
      const charCode = hash.charCodeAt(index);
      const shouldFill = charCode % 2 === 0;
      
      if (shouldFill) {
        const colorIndex = charCode % colors.length;
        const color = colors[colorIndex];
        
        // Draw pixel and its mirror
        svg += `<rect x="${j * 8}" y="${i * 8}" width="8" height="8" fill="${color}"/>`;
        svg += `<rect x="${(size - 1 - j) * 8}" y="${i * 8}" width="8" height="8" fill="${color}"/>`;
      }
    }
  }
  
  svg += `</svg>`;
  return svg;
}

// --- WebSocket Collaboration Rooms ---
const collaborationRooms: Record<string, Set<ServerWebSocket<any>>> = {};

serve({
  port: 3693, // Changed default port
  async fetch(req, server) {
    const url = new URL(req.url);
    // --- WebSocket Upgrade for Collaboration ---
    if (url.pathname.startsWith("/ws/collaboration/")) {
      if (!server.upgrade) {
        return new Response("WebSocket upgrade not supported", { status: 501 });
      }
      const artifactId = url.pathname.split("/").pop()!;
      server.upgrade(req, { data: { artifactId } });
      return new Response("Switching Protocols", { status: 101 });
    }
    // --- HTTP API logic (can be async if needed) ---
    // --- Auth Endpoints ---
    if (url.pathname === "/api/register" && req.method === "POST") {
      const { email, password } = await req.json();
      if (users.find(u => u.email === email)) return new Response("Email exists", { status: 400 });
      const user = { id: crypto.randomUUID(), email, passwordHash: hashPassword(password), role: "user", avatarSeed: email };
      users.push(user);
      return Response.json({ token: user.id, userId: user.id, role: "user" });
    }
    if (url.pathname === "/api/login" && req.method === "POST") {
      const { email, password } = await req.json();
      const user = users.find(u => u.email === email && u.passwordHash === hashPassword(password));
      if (!user) return new Response("Invalid credentials", { status: 401 });
      return Response.json({ token: user.id, userId: user.id, role: user.role });
    }

    // --- Pixel Avatar Endpoint ---
    if (url.pathname.startsWith("/api/avatar/")) {
      const seed = url.pathname.split("/").pop()!;
      return new Response(generatePixelAvatar(seed), { headers: { "Content-Type": "image/svg+xml" } });
    }

    // --- Artifact Endpoints ---
    const auth = getAuth(req);
    if (url.pathname === "/api/artifacts" && req.method === "GET") {
      if (url.searchParams.get("public") === "true") {
        return Response.json(artifacts.filter(a => a.isPublic));
      }
      if (auth.status === "user") {
        return Response.json(artifacts.filter(a => a.userId === auth.user.id));
      }
      // Guests and unauthenticated users can see the public gallery
      return new Response("Unauthorized", { status: 401 });
    }
    if (url.pathname === "/api/artifacts" && req.method === "POST") {
      if (auth.status !== "user") return new Response("Unauthorized", { status: 401 });
      const data = await req.json();
      const artifact = {
        ...data,
        id: crypto.randomUUID(),
        userId: auth.user.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isPublic: !!data.isPublic,
        likes: 0,
        dislikes: 0,
        stars: 0,
        shortUrlCode: crypto.randomUUID().slice(0, 8),
      };
      artifacts.push(artifact);
      return Response.json(artifact);
    }
    if (url.pathname.startsWith("/api/artifacts/") && req.method === "PUT") {
      if (auth.status !== "user") return new Response("Unauthorized", { status: 401 });
      const id = url.pathname.split("/").pop()!;
      const artifactIndex = artifacts.findIndex(a => a.id === id);
      if (artifactIndex === -1) return new Response("Not Found", { status: 404 });
      if (artifacts[artifactIndex].userId !== auth.user.id) return new Response("Forbidden", { status: 403 });
      const data = await req.json();
      artifacts[artifactIndex] = { ...artifacts[artifactIndex], ...data, updatedAt: new Date().toISOString() };
      return Response.json(artifacts[artifactIndex]);
    }
    if (url.pathname.startsWith("/api/artifacts/") && req.method === "DELETE") {
      if (auth.status !== "user") return new Response("Unauthorized", { status: 401 });
      const id = url.pathname.split("/").pop()!;
      const artifactIndex = artifacts.findIndex(a => a.id === id);
      if (artifactIndex === -1) return new Response("Not Found", { status: 404 });
      if (artifacts[artifactIndex].userId !== auth.user.id) return new Response("Forbidden", { status: 403 });
      artifacts.splice(artifactIndex, 1);
      return new Response("Deleted", { status: 200 });
    }

    // --- Additional Artifact Endpoints ---
    if (url.pathname.match(/^\/api\/artifacts\/[\w-]+$/) && req.method === "GET") {
      // GET /api/artifacts/:id
      const id = url.pathname.split("/").pop()!;
      const artifact = artifacts.find(a => a.id === id);
      if (!artifact) return new Response("Not Found", { status: 404 });
      // Only return if public or user has access
      if (artifact.isPublic || (auth.status === "user" && (artifact.userId === auth.user.id || (artifact.sharedWith && artifact.sharedWith.includes(auth.user.id))))) {
        return Response.json(artifact);
      }
      return new Response("Forbidden", { status: 403 });
    }
    if (url.pathname === "/api/artifacts/shared" && req.method === "GET") {
      // GET /api/artifacts/shared
      if (auth.status !== "user") return new Response("Unauthorized", { status: 401 });
      const shared = artifacts.filter(a => a.sharedWith && a.sharedWith.includes(auth.user.id));
      return Response.json(shared);
    }
    if (url.pathname === "/api/artifacts/editable" && req.method === "GET") {
      // GET /api/artifacts/editable
      if (auth.status !== "user") return new Response("Unauthorized", { status: 401 });
      const editable = artifacts.filter(a => a.userId === auth.user.id || (a.sharedWith && a.sharedWith.includes(auth.user.id)));
      return Response.json(editable);
    }

    // --- Social Feature Endpoints ---
    const socialMatch = url.pathname.match(/^\/api\/artifacts\/(.+)\/(like|dislike|star)$/);
    if (socialMatch && req.method === "POST") {
      if (auth.status !== "user") return new Response("Unauthorized", { status: 401 });
      const [, id, action] = socialMatch;
      const artifact = artifacts.find(a => a.id === id);
      if (!artifact) return new Response("Not Found", { status: 404 });
      if (action === "like") artifact.likes++;
      if (action === "dislike") artifact.dislikes++;
      if (action === "star") artifact.stars++;
      artifact.updatedAt = new Date().toISOString();
      return Response.json(artifact);
    }

    // --- Admin Endpoints ---
    if (url.pathname === "/api/admin/users" && auth.status === "admin") {
      return Response.json(users.map(u => ({ id: u.id, email: u.email, role: u.role })));
    }
    if (url.pathname === "/api/admin/artifacts" && auth.status === "admin") {
      return Response.json(artifacts);
    }
    if (url.pathname.startsWith("/api/admin/users/") && req.method === "DELETE" && auth.status === "admin") {
      const id = url.pathname.split("/").pop()!;
      const userIndex = users.findIndex(u => u.id === id);
      if (userIndex === -1) return new Response("User Not Found", { status: 404 });
      if (users[userIndex].role === 'admin') return new Response("Cannot delete admin", { status: 403 });
      users.splice(userIndex, 1);
      return new Response("User Deleted", { status: 200 });
    }
    if (url.pathname.startsWith("/api/admin/artifacts/") && req.method === "DELETE" && auth.status === "admin") {
      const id = url.pathname.split("/").pop()!;
      const artifactIndex = artifacts.findIndex(a => a.id === id);
      if (artifactIndex === -1) return new Response("Artifact Not Found", { status: 404 });
      artifacts.splice(artifactIndex, 1);
      return new Response("Artifact Deleted", { status: 200 });
    }

    // --- Pseudocode Interpreter Endpoint ---
    if (url.pathname === "/api/pseudocode/interpret" && req.method === "POST") {
      if (auth.status !== "user") return new Response("Unauthorized", { status: 401 });
      const { code } = await req.json();
      const context: { [key: string]: number } = {};
      const output: string[] = [];
      const lines = code.split("\n");

      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        const command = parts[0]?.toUpperCase();
        try {
          switch (command) {
            case "SET": // SET var TO value
              context[parts[1]] = parseFloat(parts[3]);
              break;
            case "ADD": // ADD value TO var
              context[parts[3]] += parseFloat(parts[1]);
              break;
            case "SUBTRACT": // SUBTRACT value FROM var
              context[parts[3]] -= parseFloat(parts[1]);
              break;
            case "MULTIPLY": // MULTIPLY var BY value
              context[parts[1]] *= parseFloat(parts[3]);
              break;
            case "DIVIDE": // DIVIDE var BY value
              context[parts[1]] /= parseFloat(parts[3]);
              break;
            case "OUTPUT": // OUTPUT var
              output.push(String(context[parts[1]]));
              break;
          }
        } catch (e) {
          return new Response(`Error executing line: ${line}`, { status: 400 });
        }
      }
      return Response.json({ result: context, output });
    }

    // --- Dashboard API Endpoints ---
    if (url.pathname === "/api/dashboard/stats" && req.method === "GET") {
      if (auth.status !== "user") return new Response("Unauthorized", { status: 401 });
      const userArtifacts = artifacts.filter(a => a.userId === auth.user.id);
      const bins = userArtifacts.reduce((acc, artifact) => {
        if (artifact.bin && !acc.includes(artifact.bin)) acc.push(artifact.bin);
        return acc;
      }, [] as string[]);
      
      return Response.json({
        totalArtifacts: userArtifacts.length,
        totalBins: bins.length,
        totalUsers: users.length,
        recentActivity: userArtifacts.filter(a => 
          new Date(a.updatedAt).getTime() > Date.now() - 24 * 60 * 60 * 1000
        ).length
      });
    }

    if (url.pathname === "/api/dashboard/activity" && req.method === "GET") {
      if (auth.status !== "user") return new Response("Unauthorized", { status: 401 });
      const recentArtifacts = artifacts
        .filter(a => a.userId === auth.user.id)
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 10)
        .map(a => ({
          id: a.id,
          type: 'upload',
          description: `Artifact "${a.name}" updated`,
          timestamp: new Date(a.updatedAt).toISOString(),
          user: auth.user.email
        }));
      
      return Response.json(recentArtifacts);
    }

    // --- Bins API Endpoints ---
    if (url.pathname === "/api/bins" && req.method === "GET") {
      if (auth.status !== "user") return new Response("Unauthorized", { status: 401 });
      const userArtifacts = artifacts.filter(a => a.userId === auth.user.id);
      const binsMap = new Map();
      
      userArtifacts.forEach(artifact => {
        if (artifact.bin) {
          if (!binsMap.has(artifact.bin)) {
            binsMap.set(artifact.bin, {
              id: artifact.bin,
              name: artifact.bin,
              artifactCount: 0,
              visibility: 'private',
              createdAt: artifact.createdAt,
              updatedAt: artifact.updatedAt,
              tags: [],
              collaborators: 1
            });
          }
          const bin = binsMap.get(artifact.bin);
          bin.artifactCount++;
          bin.updatedAt = artifact.updatedAt > bin.updatedAt ? artifact.updatedAt : bin.updatedAt;
        }
      });
      
      return Response.json(Array.from(binsMap.values()));
    }

    if (url.pathname === "/api/bins" && req.method === "POST") {
      if (auth.status !== "user") return new Response("Unauthorized", { status: 401 });
      const binData = await req.json();
      // For now, just return the bin data as bins are implicit in our artifact system
      return Response.json({ ...binData, id: crypto.randomUUID() });
    }

    // --- Upload API Endpoints ---
    if (url.pathname === "/api/artifacts/upload" && req.method === "POST") {
      if (auth.status !== "user") return new Response("Unauthorized", { status: 401 });
      // Handle file upload (for now, just simulate success)
      return Response.json({ 
        id: crypto.randomUUID(), 
        message: "File uploaded successfully",
        status: "success"
      });
    }

    if (url.pathname === "/api/artifacts/text" && req.method === "POST") {
      if (auth.status !== "user") return new Response("Unauthorized", { status: 401 });
      const data = await req.json();
      const artifact = {
        ...data,
        id: crypto.randomUUID(),
        userId: auth.user.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isPublic: data.visibility === 'public',
        likes: 0,
        dislikes: 0,
        stars: 0,
        shortUrlCode: crypto.randomUUID().slice(0, 8),
      };
      artifacts.push(artifact);
      return Response.json(artifact);
    }

    if (url.pathname === "/api/artifacts/url" && req.method === "POST") {
      if (auth.status !== "user") return new Response("Unauthorized", { status: 401 });
      const data = await req.json();
      // Simulate fetching content from URL
      const artifact = {
        ...data,
        content: `Content fetched from ${data.url}`,
        id: crypto.randomUUID(),
        userId: auth.user.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isPublic: data.visibility === 'public',
        likes: 0,
        dislikes: 0,
        stars: 0,
        shortUrlCode: crypto.randomUUID().slice(0, 8),
      };
      artifacts.push(artifact);
      return Response.json(artifact);
    }

    // --- Search API Endpoints ---
    if (url.pathname === "/api/search" && req.method === "GET") {
      const query = url.searchParams.get("q") || "";
      const type = url.searchParams.get("type") || "all";
      const visibility = url.searchParams.get("visibility") || "all";
      
      let results = artifacts;
      
      // Apply search filter
      if (query) {
        results = results.filter(a => 
          a.name.toLowerCase().includes(query.toLowerCase()) ||
          a.content?.toLowerCase().includes(query.toLowerCase()) ||
          a.tags?.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
        );
      }
      
      // Apply type filter
      if (type !== "all") {
        results = results.filter(a => a.type === type);
      }
      
      // Apply visibility filter
      if (visibility === "public") {
        results = results.filter(a => a.isPublic);
      } else if (auth.status === "user") {
        results = results.filter(a => 
          a.isPublic || 
          a.userId === auth.user.id || 
          (a.sharedWith && a.sharedWith.includes(auth.user.id))
        );
      } else {
        results = results.filter(a => a.isPublic);
      }
      
      return Response.json(results);
    }

    // --- Sharing API Endpoints ---
    if (url.pathname === "/api/sharing/collections" && req.method === "GET") {
      if (auth.status !== "user") return new Response("Unauthorized", { status: 401 });
      const userArtifacts = artifacts.filter(a => a.userId === auth.user.id);
      const sharedArtifacts = artifacts.filter(a => 
        a.sharedWith && a.sharedWith.includes(auth.user.id)
      );
      
      return Response.json({
        owned: userArtifacts.filter(a => a.isPublic || a.sharedWith),
        shared: sharedArtifacts
      });
    }

    if (url.pathname.match(/^\/api\/artifacts\/[\w-]+\/share$/) && req.method === "POST") {
      if (auth.status !== "user") return new Response("Unauthorized", { status: 401 });
      const id = url.pathname.split("/")[3];
      const { emails, permissions } = await req.json();
      
      const artifact = artifacts.find(a => a.id === id);
      if (!artifact || artifact.userId !== auth.user.id) {
        return new Response("Not found or unauthorized", { status: 404 });
      }
      
      // Find users by email and add to sharedWith
      const userIds = users.filter(u => emails.includes(u.email)).map(u => u.id);
      artifact.sharedWith = [...(artifact.sharedWith || []), ...userIds];
      artifact.updatedAt = new Date().toISOString();
      
      return Response.json({ message: "Shared successfully", sharedWith: userIds });
    }

    // --- Integrations API Endpoints ---
    if (url.pathname === "/api/integrations" && req.method === "GET") {
      if (auth.status !== "user") return new Response("Unauthorized", { status: 401 });
      return Response.json([
        { id: 'github', name: 'GitHub', status: 'available', description: 'Import from GitHub repositories' },
        { id: 'gitlab', name: 'GitLab', status: 'available', description: 'Import from GitLab projects' },
        { id: 'notion', name: 'Notion', status: 'coming-soon', description: 'Sync with Notion databases' },
        { id: 'slack', name: 'Slack', status: 'available', description: 'Share artifacts in Slack channels' }
      ]);
    }

    // --- Metrics API Endpoints ---
    if (url.pathname === "/api/metrics/overview" && req.method === "GET") {
      if (auth.status !== "user") return new Response("Unauthorized", { status: 401 });
      const userArtifacts = artifacts.filter(a => a.userId === auth.user.id);
      
      return Response.json({
        totalViews: userArtifacts.reduce((sum, a) => sum + (a.views || 0), 0),
        totalDownloads: userArtifacts.reduce((sum, a) => sum + (a.downloads || 0), 0),
        totalLikes: userArtifacts.reduce((sum, a) => sum + (a.likes || 0), 0),
        totalShares: userArtifacts.reduce((sum, a) => sum + (a.shares || 0), 0),
        topArtifacts: userArtifacts
          .sort((a, b) => (b.views || 0) - (a.views || 0))
          .slice(0, 5)
          .map(a => ({ id: a.id, name: a.name, views: a.views || 0 }))
      });
    }

    // --- Users API Endpoints ---
    if (url.pathname === "/api/users" && req.method === "GET") {
      if (auth.status !== "user") return new Response("Unauthorized", { status: 401 });
      return Response.json({
        users: users.map(u => ({
          id: u.id,
          email: u.email,
          role: u.role,
          avatarSeed: u.avatarSeed
        }))
      });
    }

    if (url.pathname === "/api/users/profile" && req.method === "GET") {
      if (auth.status !== "user") return new Response("Unauthorized", { status: 401 });
      return Response.json({
        id: auth.user.id,
        email: auth.user.email,
        role: auth.user.role,
        avatarSeed: auth.user.avatarSeed
      });
    }

    if (url.pathname === "/api/users/profile" && req.method === "PUT") {
      if (auth.status !== "user") return new Response("Unauthorized", { status: 401 });
      const updates = await req.json();
      const userIndex = users.findIndex(u => u.id === auth.user.id);
      if (userIndex !== -1) {
        users[userIndex] = { ...users[userIndex], ...updates };
        return Response.json(users[userIndex]);
      }
      return new Response("User not found", { status: 404 });
    }

    // --- Settings API Endpoints ---
    if (url.pathname === "/api/settings" && req.method === "GET") {
      if (auth.status !== "user") return new Response("Unauthorized", { status: 401 });
      return Response.json({
        theme: 'system',
        notifications: true,
        privacy: 'private',
        sharing: 'team'
      });
    }

    if (url.pathname === "/api/settings" && req.method === "PUT") {
      if (auth.status !== "user") return new Response("Unauthorized", { status: 401 });
      const settings = await req.json();
      // In a real app, save to database
      return Response.json(settings);
    }

    // --- Labs API Endpoints ---
    if (url.pathname === "/api/labs/features" && req.method === "GET") {
      return Response.json([
        { id: 'ai-suggestions', name: 'AI Suggestions', enabled: false, description: 'Get AI-powered artifact suggestions' },
        { id: 'realtime-collab', name: 'Real-time Collaboration', enabled: true, description: 'Collaborate on artifacts in real-time' },
        { id: 'advanced-search', name: 'Advanced Search', enabled: false, description: 'Semantic search with AI' }
      ]);
    }

    return new Response("Not found", { status: 404 });
  },
  websocket: {
    open(ws) {
      const artifactId = (ws.data as any).artifactId;
      if (!artifactId) return;
      if (!collaborationRooms[artifactId]) collaborationRooms[artifactId] = new Set();
      collaborationRooms[artifactId].add(ws);
    },
    message(ws, message) {
      const artifactId = (ws.data as any).artifactId;
      for (const client of collaborationRooms[artifactId] || []) {
        if (client !== ws && client.readyState === 1) {
          client.send(message);
        }
      }
    },
    close(ws) {
      const artifactId = (ws.data as any).artifactId;
      collaborationRooms[artifactId]?.delete(ws);
    }
  }
});
