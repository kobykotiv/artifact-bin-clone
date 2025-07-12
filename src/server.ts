// src/server.ts
// Bun server with user auth, public gallery API, and pixel avatar endpoint
import { serve } from "bun";
import crypto from "crypto";

// --- In-memory DB (replace with real DB in production) ---
const users: any[] = [
  { id: "admin", email: "admin@example.com", passwordHash: "admin", role: "admin", avatarSeed: "admin" }
];
const artifacts: any[] = [];

// --- Helper: Hash password (use bcrypt in production) ---
function hashPassword(password: string) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

// --- Auth Middleware ---
function getAuth(req: Request) {
  const auth = req.headers.get("authorization");
  if (!auth) return { status: "unauthenticated" };
  if (auth.startsWith("Basic ")) {
    // Admin HTTP Basic Auth
    const [user, pass] = atob(auth.replace("Basic ", "")).split(":");
    if (user === "admin" && pass === "admin") {
      return { status: "admin", user: users[0] };
    }
  }
  if (auth.startsWith("Bearer ")) {
    const userId = auth.replace("Bearer ", "");
    const user = users.find(u => u.id === userId);
    if (user) return { status: "user", user };
  }
  return { status: "unauthenticated" };
}

// --- Pixel Avatar API ---
function generatePixelAvatar(seed: string): string {
  const color = "#" + crypto.createHash("md5").update(seed).digest("hex").slice(0, 6);
  return `<svg width="64" height="64"><rect width="64" height="64" fill="${color}"/></svg>`;
}

// --- Bun Server ---
serve({
  port: 3693, // Changed default port
  async fetch(req) {
    const url = new URL(req.url);

    // --- [DASHBOARD SCAFFOLD] ---
    // The frontend dashboard would interact with the following API endpoints.
    //
    // 1. Authentication:
    //    - POST /api/register: Create a new user account.
    //    - POST /api/login: Log in and receive a bearer token (user.id).
    //
    // 2. User's Artifacts (Private View):
    //    - GET /api/artifacts: (with "Authorization: Bearer <token>") Fetch all artifacts for the logged-in user.
    //    - POST /api/artifacts: (with "Authorization: Bearer <token>") Create a new artifact.
    //    - PUT /api/artifacts/:id: (with "Authorization: Bearer <token>") Update an existing artifact.
    //    - DELETE /api/artifacts/:id: (with "Authorization: Bearer <token>") Delete an artifact.
    //
    // 3. Public Gallery (Guest & User View):
    //    - GET /api/artifacts?public=true: Fetch all artifacts where `isPublic` is true.
    //
    // 4. Avatars:
    //    - GET /api/avatar/:seed: Get a unique pixel avatar for a user or artifact.
    //
    // 5. Admin Panel:
    //    - GET /api/admin/users: (with Basic Auth) View all users.
    //    - GET /api/admin/artifacts: (with Basic Auth) View all artifacts.
    // -----------------------------

    // --- Pseudocode for a complete Dashboard API ---
    /*
      This outlines the full API surface that a frontend dashboard would interact with.

      --- AUTHENTICATION ---
      - POST /api/register: { email, password } -> { token, userId, role }
        - Creates a new user. (Implemented)
      - POST /api/login: { email, password } -> { token, userId, role }
        - Logs in a user. (Implemented)
      - GET /api/auth/status: (Requires Bearer token) -> { user }
        - Verifies a token and returns the current user's data.
      - POST /api/logout: (Requires Bearer token)
        - Invalidates a user's session/token (if using a session store).

      --- USER ARTIFACTS (CRUD) ---
      - GET /api/artifacts: (Requires Bearer token) -> [Artifact]
        - Gets all artifacts for the authenticated user. (Implemented)
      - GET /api/artifacts/:id: (Requires Bearer token) -> Artifact
        - Gets a single artifact by ID. User must be the owner.
      - POST /api/artifacts: (Requires Bearer token) { artifactData } -> Artifact
        - Creates a new artifact. (Implemented)
      - PUT /api/artifacts/:id: (Requires Bearer token) { artifactData } -> Artifact
        - Updates an existing artifact. User must be the owner.
      - DELETE /api/artifacts/:id: (Requires Bearer token)
        - Deletes an artifact. User must be the owner.

      --- PUBLIC GALLERY ---
      - GET /api/artifacts?public=true: -> [Artifact]
        - Gets all artifacts where `isPublic` is true. No auth required. (Implemented)

      --- SOCIAL FEATURES ---
      - POST /api/artifacts/:id/like: (Requires Bearer token) -> { likes }
        - Increments the 'likes' count for an artifact.
      - POST /api/artifacts/:id/dislike: (Requires Bearer token) -> { dislikes }
        - Increments the 'dislikes' count.
      - POST /api/artifacts/:id/star: (Requires Bearer token) -> { stars }
        - Increments the 'stars' count.

      --- AVATARS ---
      - GET /api/avatar/:seed: -> SVG Image
        - Generates a unique pixel avatar based on a seed. (Implemented)

      --- PSEUDOCODE INTERPRETER (Future Feature) ---
      - POST /api/pseudocode/interpret: { code: string, context: any } -> { result: any, output: string[] }
        - Takes a string of pseudocode and an execution context.
        - Returns the result and any console output.

      --- ADMIN PANEL (Requires Basic Auth) ---
      - GET /api/admin/users: -> [User]
        - Lists all users. (Implemented)
      - DELETE /api/admin/users/:id:
        - Deletes a user.
      - GET /api/admin/artifacts: -> [Artifact]
        - Lists all artifacts from all users. (Implemented)
      - DELETE /api/admin/artifacts/:id:
        - Deletes any artifact.
    */

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
  }
});
