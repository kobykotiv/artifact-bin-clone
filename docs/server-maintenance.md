# Artifact Bin Bun Server Maintenance Guide

This document provides guidance for maintaining the Bun-powered backend server (`src/server.ts`) for Artifact Bin.

---

## Table of Contents
- [General Maintenance](#general-maintenance)
- [User and Artifact Data](#user-and-artifact-data)
- [Authentication](#authentication)
- [Public Gallery](#public-gallery)
- [Pixel Avatar Endpoint](#pixel-avatar-endpoint)
- [Social Features](#social-features)
- [Admin Endpoints](#admin-endpoints)
- [Pseudocode Interpreter](#pseudocode-interpreter)
- [Troubleshooting](#troubleshooting)
- [Extending the Server](#extending-the-server)

---

## General Maintenance
- **Restarting the Server:**
  - Use `bun run src/server.ts` to start the server.
  - The server listens on port `3693` by default.
- **Persistence:**
  - All data is stored in-memory. Restarting the server will erase all users and artifacts.
  - For production, replace in-memory arrays with a persistent database (e.g., SQLite, Postgres, MongoDB).

## User and Artifact Data
- **User Data:**
  - Users are stored in the `users` array.
  - Passwords are hashed with SHA-256 (use bcrypt or Argon2 in production).
- **Artifacts:**
  - Artifacts are stored in the `artifacts` array.
  - Each artifact can be public or private, and supports likes, dislikes, and stars.

## Authentication
- **Register:**
  - POST `/api/register` creates a new user.
- **Login:**
  - POST `/api/login` returns a bearer token (user ID).
- **Auth Middleware:**
  - Checks for `Authorization: Bearer <token>` or HTTP Basic Auth for admin endpoints.

## Public Gallery
- **Endpoint:**
  - GET `/api/artifacts?public=true` returns all public artifacts.
  - No authentication required for this endpoint.

## Pixel Avatar Endpoint
- **Endpoint:**
  - GET `/api/avatar/:seed` returns a deterministic SVG avatar based on the seed.
- **Maintenance:**
  - The avatar is generated using an MD5 hash of the seed.
  - No storage or caching is required.

## Social Features
- **Endpoints:**
  - POST `/api/artifacts/:id/like|dislike|star` increments the respective count.
- **Maintenance:**
  - These counts are stored on the artifact object.

## Admin Endpoints
- **Endpoints:**
  - GET `/api/admin/users` and `/api/admin/artifacts` (Basic Auth required).
  - DELETE endpoints for users and artifacts.
- **Maintenance:**
  - Only the admin user (default: `admin:admin`) can access these endpoints.
  - Do not delete the admin user.

## Pseudocode Interpreter
- **Endpoint:**
  - POST `/api/pseudocode/interpret` (Bearer token required).
- **Maintenance:**
  - This is an experimental feature for interpreting simple pseudocode.
  - Errors in pseudocode will return a 400 response.

## Troubleshooting
- **Server Not Starting:**
  - Ensure Bun is installed and up to date.
  - Check for port conflicts on `3693`.
- **Data Loss:**
  - All data is lost on server restart. Use a persistent DB for production.
- **Authentication Issues:**
  - Ensure correct headers are sent (`Authorization: Bearer <token>` or Basic Auth for admin).
- **CORS:**
  - Add CORS headers if accessing the API from a different origin.

## Extending the Server
- **Add New Endpoints:**
  - Follow the existing pattern in `src/server.ts` for new routes.
- **Switch to Persistent Storage:**
  - Replace the `users` and `artifacts` arrays with a database.
- **Security:**
  - Use secure password hashing (bcrypt/argon2).
  - Implement rate limiting and input validation for all endpoints.

---

For more details, see the code and comments in `src/server.ts`.
