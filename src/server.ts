// src/server.ts
// Bun server with user auth, public gallery API, and pixel avatar endpoint
import { serve } from "bun";
import crypto from "crypto";
import type { ServerWebSocket } from "bun";

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
