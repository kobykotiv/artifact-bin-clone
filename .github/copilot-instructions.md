# Global Instruction Set for the Tech Stack

## Overview
This document outlines the global instructions for working with the tech stack used in the `artifact-bin` project. The stack includes frontend, backend, database, DevOps, and testing tools.

---

## Frontend
- **Frameworks**: The project uses React with Tailwind CSS for styling.
- **Component Library**: `shadcn` is used for reusable UI components.
- **State Management**: React's built-in state management is used.
- **Code Editor**: Monaco Editor is integrated for code editing functionality.
- **Build Tool**: The project is built using Bun.

### Guidelines
1. Use `Tailwind CSS` utility classes for styling.
2. Follow the component structure in `/src/components`.
3. Use `shadcn/ui` components for consistency.
4. Test UI changes in multiple screen sizes for responsiveness.

---

## Backend
- **Framework**: The backend is powered by Bun's server capabilities.
- **API Design**: RESTful APIs are defined in `/src/index.tsx`.
- **Service Worker**: A service worker is implemented for PWA support.

### Guidelines
1. Define new API routes in `/src/index.tsx`.
2. Use `IndexedDB` for local data storage.
3. Follow RESTful conventions for API endpoints.

---

## Database
- **Primary Storage**: IndexedDB is used for local storage.
- **Data Models**: Defined in `/src/lib/services/db`.

### Guidelines
1. Use `ArtifactData` and related types for database operations.
2. Ensure data integrity by validating inputs using Zod schemas.
3. Test database changes in offline mode.

---

## DevOps
- **CI/CD**: GitHub Actions is recommended for CI/CD pipelines.
- **Containerization**: Docker can be used for local development if needed.
- **Deployment**: The app is designed to run as a PWA.

### Guidelines
1. Use `bun dev` for local development.
2. Run `bun run build` to create production builds.
3. Ensure static assets like `manifest.json` and icons are updated before deployment.

---

## Testing
- **Frameworks**: Jest and React Testing Library are recommended.
- **End-to-End Testing**: Cypress can be used for E2E tests.

### Guidelines
1. Write unit tests for all new components and utilities.
2. Use mock data for testing database interactions.
3. Run tests locally using `bun test`.

---

## Additional Notes
- **Code Style**: Follow the ESLint and Prettier configurations in the project.
- **Documentation**: Update the `README.md` and inline comments for any new features.
- **Collaboration**: Use the `ProjectGenerator` and `BusinessPlanGenerator` components for structured project planning.

---  

Include a progress report at the end of each task, detailing what has been completed and what remains to be done.

## Example Progress Report
- **Task**: Implement user authentication
- **Completed**:
  - Set up user model in IndexedDB.
  - Created API endpoints for login and registration.
  - Implemented UI components for login and registration forms.
- **Remaining**:
  - Write unit tests for authentication logic.
  - Integrate authentication with the frontend state management.
- **Next Steps**:
  - Review code with the team.
  - Deploy changes to staging environment for testing.
- **Estimated Completion**: 2 days
- **Challenges**:
  - Need to resolve CORS issues with API calls.
  - Ensure secure storage of user credentials.
- **Dependencies**:
  - Waiting for design approval on the login UI.
  - Need to finalize API response formats with the backend team.
- **Feedback**:
  - Team feedback on the UI design is positive.
  - Need to improve error handling in API responses.
- **Lessons Learned**:
  - Importance of thorough testing for authentication flows.
  - Need to document API endpoints for future reference.

Frontend: React + TypeScript + Tailwind CSS (keep current setup)
State Management: React Context API (you're already using)
Database: Extend IndexedDB with folder support
Authentication: Continue with current auth system