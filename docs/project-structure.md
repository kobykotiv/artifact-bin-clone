# Project Structure

## Folders

- `/src`: Main source code
  - `/components`: React components
    - `/ui`: UI components from shadcn/ui
    - `/Dashboard`: Dashboard-specific components
      - `/Dashboard.tsx`: Main entry point for the dashboard feature. Sets up `DashboardProvider` and renders `DashboardLayout`.
      - `/DashboardLayout.tsx`: Core layout component for the authenticated user experience. Integrates all dashboard features like explorer panel (artifacts, folders), main content area for artifact viewing/editing, and a right sidebar with statistics, quick actions, SaaS strategies, Git panel, and suggestion feed.
      - `/DashboardContext.tsx`: React context provider for managing all dashboard-related state and actions (artifacts, folders, layout visibility, CRUD operations).
      - `/StatsCard.tsx`: Component for displaying user activity and artifact statistics. Used within `DashboardLayout`.
      - `/SaaSStrategies.tsx`: Component for displaying SaaS strategy guides. Used within `DashboardLayout`.
      - `/FolderView.tsx`: Component for navigating and managing folders. Used within `DashboardLayout`.
      - `/types.ts`: TypeScript type definitions specific to the Dashboard components and state.
  - `/lib`: Utilities, services and models
    - `/artifactTypes`: Registry and components for different artifact types
    - `/services`: Service layers (auth, db, etc)
    - `/templates`: Prompt and ticket templates
    - `/utils`: Utility functions (fileTypes, export, random, etc.)
  - `/styles`: Global CSS styles, including `dashboard.css`
  - `/pages`: (if using Next.js) Page components
  - `/app`: (if using Next.js App Router) App routes

## Key Features

- **Artifact Management**: Create, store, and organize code snippets and documents.
- **Folder Organization**: Group artifacts into folders with nesting and sharing capabilities.
- **Prompt Library**: Create and use templated prompts with variables.
- **Business Plan Generation**: Generate various business documents.
- **Integrated Dashboard**: A comprehensive, centralized dashboard initiated by `Dashboard.tsx` and structured by `DashboardLayout.tsx` for managing all aspects of the application when authenticated. Features include:
    - Unified artifact and folder exploration.
    - Powerful search and filtering for artifacts.
    - At-a-glance statistics display via `StatsCard.tsx`.
    - Convenient Quick Actions panel for common operations.
    - Informative SaaS strategy guides via `SaaSStrategies.tsx`.
    - Integrated Git panel for version control insights.
    - AI-powered Suggestion Feed for contextual help.
    - Robust state management via `DashboardContext.tsx`.

## Tech Stack

- Frontend: React with TypeScript
- State Management: React Context API (for Dashboard) / Zustand (potentially for global state)
- UI Components: shadcn/ui
- Backend: (Assumed Node.js with Express if server-side features are built out)
- Database: IndexedDB (client-side), MongoDB (potential server-side)
- Authentication: JWT (if server-side auth is implemented)
- File Storage: (Client-side for now, AWS S3 or similar for server-side)
