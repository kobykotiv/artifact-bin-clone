# Artifact Bin Bun Server API Documentation

This document describes the API endpoints and server logic for the Bun-powered backend in `src/server.ts`.

---

## Overview
- **Framework:** Bun
- **Port:** 3693
- **Purpose:** Provides authentication, artifact CRUD, public gallery, pixel avatar, and admin endpoints for the Artifact Bin app.
- **Storage:** In-memory arrays (replace with a real DB for production)

---

## Authentication Endpoints

### Register
- **POST** `/api/register`
- **Body:** `{ email, password }`
- **Response:** `{ token, userId, role }`
- **Notes:**
  - Creates a new user. Fails if email exists.

### Login
- **POST** `/api/login`
- **Body:** `{ email, password }`
- **Response:** `{ token, userId, role }`
- **Notes:**
  - Returns a bearer token (user ID) on success.

---

## User Artifacts (Private)

### Get All Artifacts (User)
- **GET** `/api/artifacts`
- **Headers:** `Authorization: Bearer <token>`
- **Response:** `[Artifact]`
- **Notes:**
  - Returns all artifacts for the authenticated user.

### Create Artifact
- **POST** `/api/artifacts`
- **Headers:** `Authorization: Bearer <token>`
- **Body:** `{ artifactData }`
- **Response:** `Artifact`

### Update Artifact
- **PUT** `/api/artifacts/:id`
- **Headers:** `Authorization: Bearer <token>`
- **Body:** `{ artifactData }`
- **Response:** `Artifact`

### Delete Artifact
- **DELETE** `/api/artifacts/:id`
- **Headers:** `Authorization: Bearer <token>`
- **Response:** `"Deleted"`

---

## Public Gallery

### Get Public Artifacts
- **GET** `/api/artifacts?public=true`
- **Response:** `[Artifact]`
- **Notes:**
  - Returns all artifacts where `isPublic` is true. No auth required.

---

## Pixel Avatar

### Get Pixel Avatar
- **GET** `/api/avatar/:seed`
- **Response:** SVG image
- **Notes:**
  - Generates a unique pixel avatar based on the seed.

---

## Social Features

### Like/Dislike/Star Artifact
- **POST** `/api/artifacts/:id/like|dislike|star`
- **Headers:** `Authorization: Bearer <token>`
- **Response:** `Artifact`

---

## Admin Endpoints (Basic Auth Required)

### List All Users
- **GET** `/api/admin/users`
- **Headers:** `Authorization: Basic <base64(admin:admin)>`
- **Response:** `[User]`

### List All Artifacts
- **GET** `/api/admin/artifacts`
- **Headers:** `Authorization: Basic <base64(admin:admin)>`
- **Response:** `[Artifact]`

### Delete User
- **DELETE** `/api/admin/users/:id`
- **Headers:** `Authorization: Basic <base64(admin:admin)>`
- **Response:** `"User Deleted"`

### Delete Artifact
- **DELETE** `/api/admin/artifacts/:id`
- **Headers:** `Authorization: Basic <base64(admin:admin)>`
- **Response:** `"Artifact Deleted"`

---

## Pseudocode Interpreter (Experimental)

### Interpret Pseudocode
- **POST** `/api/pseudocode/interpret`
- **Headers:** `Authorization: Bearer <token>`
- **Body:** `{ code: string }`
- **Response:** `{ result: object, output: string[] }`

---

## Notes
- All data is stored in-memory. Restarting the server will clear all users and artifacts.
- For production, replace in-memory arrays with a persistent database.
- The API is designed for use with the Artifact Bin frontend, but can be used by any HTTP client.
- Pixel avatars are deterministic SVGs based on the provided seed.

---

## Example Usage

### Register a User
```sh
curl -X POST http://localhost:3693/api/register -H 'Content-Type: application/json' -d '{"email":"user@example.com","password":"test123"}'
```

### Login
```sh
curl -X POST http://localhost:3693/api/login -H 'Content-Type: application/json' -d '{"email":"user@example.com","password":"test123"}'
```

### Get Public Artifacts
```sh
curl http://localhost:3693/api/artifacts?public=true
```

### Get Pixel Avatar
```sh
curl http://localhost:3693/api/avatar/some-seed
```

---

For more details, see `src/server.ts`.
