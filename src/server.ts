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
  port: 3693,
  async fetch(req) {
    const url = new URL(req.url);

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
    // ...add PUT/DELETE endpoints as needed...

    // --- Admin Endpoints ---
    if (url.pathname === "/api/admin/users" && auth.status === "admin") {
      return Response.json(users.map(u => ({ id: u.id, email: u.email, role: u.role })));
    }
    if (url.pathname === "/api/admin/artifacts" && auth.status === "admin") {
      return Response.json(artifacts);
    }

    return new Response("Not found", { status: 404 });
  }
});
