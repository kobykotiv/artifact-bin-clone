# Maintainers Guide: Artifact Binny

Welcome to the Artifact Binny maintainers documentation. This guide will help you understand the project structure, key conventions, and best practices for maintaining and extending the codebase.

## Project Overview
Artifact Binny is a modern web application for managing code snippets, microblog posts, and collaborative artifacts. It features authentication, a dashboard, a live preview system, a microblog CMS, and a flexible folder explorer with drag-and-drop, tagging, and sharing.

## Key Directories
- `src/components/` — All React UI components (e.g., Dashboard, FolderExplorer, LivePreview, microblog, etc.)
- `src/lib/` — Utility libraries, hooks, and service logic (e.g., db.ts, notifications.ts, auth.ts)
- `src/models/` — Mongoose models for MongoDB persistence (User, Post, etc.)
- `src/pages/api/` — Next.js API routes for backend logic (users, posts, microblog, forks, etc.)
- `docs/` — Project documentation and guides

## Main Features
- **Authentication**: Google OAuth and guest login via `AuthContext` and `authService`.
- **Dashboard**: Main user interface for managing artifacts, posts, and folders.
- **Folder Explorer**: Animated sidebar for organizing folders and artifacts, with drag-and-drop, tagging, and sharing.
- **Live Preview**: Real-time preview for code snippets and forks/variations.
- **Microblog CMS**: Social microblogging with @usernames, tags, and a REST API.
- **API**: RESTful endpoints for users, posts, microblog, and forks.

## Conventions
- **TypeScript**: All code is written in TypeScript for type safety.
- **React**: Functional components and hooks are used throughout.
- **API**: Next.js API routes use Mongoose for MongoDB persistence.
- **Styling**: Tailwind CSS and custom classes for UI consistency.
- **Testing**: Tests are in `src/components/__tests__/` and related folders.

## Adding Features
- Add new React components to `src/components/`.
- Add new API endpoints to `src/pages/api/`.
- Add new Mongoose models to `src/models/`.
- Use `dbConnect.ts` for MongoDB connection reuse in API routes.
- Update or add tests in `__tests__/` as needed.

## Running Locally
1. Install dependencies: `npm install` or `bun install`
2. Set up `.env` with your MongoDB URI and any required secrets.
3. Start the dev server: `npm run dev` or `bun run dev`
4. Access the app at `http://localhost:3000`

## Deployment
- Deploy to Vercel, Netlify, or your preferred platform.
- Ensure environment variables are set for production.
- MongoDB Atlas is recommended for managed database hosting.

## Best Practices
- Keep components small and focused.
- Use hooks for shared logic.
- Write and update tests for new features.
- Document new APIs and components in the `docs/` folder.
- Use feature branches and pull requests for changes.

## Contact
For questions or to join as a maintainer, open an issue or contact the project lead.

---

Happy hacking!
