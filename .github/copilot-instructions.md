# Global Instruction Set for the Tech Stack

## Overview
This document outlines the global instructions for working with the tech stack used in the `artifact-bin` project. The stack is designed for building a modern, scalable, and maintainable web application. All development should adhere to these guidelines to ensure consistency and quality.

---

## Frontend
- **Framework**: React with TypeScript, built with Vite (via `bun create vite`).
- **Styling**: Tailwind CSS for utility-first styling.
- **Component Library**: `shadcn/ui` for accessible and reusable UI components.
- **State Management**: React's Context API for simple state. For more complex, global state, consider a lightweight library like Zustand.
- **Data Fetching**: Use the native `fetch` API or a library like `axios` to interact with the backend REST API. For more complex scenarios involving caching and optimistic updates, `react-query` (TanStack Query) is recommended.
- **Code Editor**: Monaco Editor is integrated for in-app code editing.

### Guidelines
1.  **Component-Based Architecture**: Build features as modular and reusable components located in `/src/components`.
2.  **Styling**: Strictly use Tailwind CSS utility classes. Avoid writing custom CSS files where possible.
3.  **API Interaction**: All data must be fetched from the backend API. Do not attempt to connect to the database directly from the frontend.
4.  **Responsiveness**: Ensure all UI components are fully responsive and tested on various screen sizes.
5.  **Environment Variables**: Use `.env` files for frontend-specific environment variables (e.g., `VITE_API_BASE_URL`).

---

## Backend
- **Runtime**: Bun.
- **Framework**: A structured framework like ElysiaJS is recommended for building the REST API on top of Bun's native server. This provides routing, middleware, and plugin support.
- **API Design**: Design and implement a clean RESTful API.
- **Authentication**: Implement JWT (JSON Web Token) based authentication. Store tokens securely on the client (e.g., in `HttpOnly` cookies).

### Guidelines
1.  **Project Structure**: Organize the backend code into logical modules:
    - `/src/controllers`: Handle incoming requests and send responses.
    - `/src/services`: Contain the business logic.
    - `/src/models`: Define Mongoose database schemas.
    - `/src/routes`: Define API endpoints and connect them to controllers.
    - `/src/middleware`: For authentication, logging, and error handling.
2.  **Validation**: Use a library like `Zod` to validate all incoming request bodies and parameters at the controller or route level.
3.  **Configuration**: Use environment variables (`.env` file) for all configuration, including database connection strings, JWT secrets, and port numbers. Never hard-code secrets.

---

## Database
- **Technology**: MongoDB.
- **ODM (Object-Document Mapper)**: Mongoose for data modeling, schema validation, and business logic hooks.
- **Hosting**: MongoDB Atlas (free tier is sufficient for development).

### Guidelines
1.  **Schema Definition**: Define all Mongoose schemas in `/src/lib/models`. Each model should have its own file (e.g., `user.model.ts`).
2.  **Connection Management**: Create a single database connection manager (e.g., in `/src/lib/db.ts`) that handles connecting to MongoDB on server startup and gracefully disconnecting on shutdown.
3.  **Data Access Layer**: All database interactions must go through service functions that use the Mongoose models. Controllers should not interact with Mongoose models directly.
4.  **Indexing**: Define appropriate indexes in your Mongoose schemas to ensure efficient query performance, especially for frequently queried fields.

---

## DevOps
- **Environment Management**: Use `.env` files for local development. A `.env.example` file should be committed to the repository to show required variables.
- **CI/CD**: Configure GitHub Actions to run tests and linting on every push and pull request.
- **Containerization**: Use Docker and Docker Compose to create a consistent development environment and for production deployment. A `Dockerfile` for the Bun application and a `docker-compose.yml` file should be maintained.
- **Deployment**: The application should be designed to be deployed as a containerized service to platforms like AWS, Google Cloud, or Vercel.

### Guidelines
1.  **Local Development**: Use `bun run dev` to start the development server with hot-reloading.
2.  **Production Build**: Use `bun run build` to create an optimized production build of the frontend and backend.
3.  **Secrets Management**: Use GitHub Secrets or a similar service to manage production environment variables in the CI/CD pipeline.

---

## Testing
- **Frontend**: Use Vitest for unit and component testing with React Testing Library.
- **Backend**: Use `bun:test` for unit and integration tests.
- **E2E Testing**: Use Cypress or Playwright for end-to-end testing of user flows.

### Guidelines
1.  **Test Coverage**: Aim for high test coverage, especially for critical business logic in the service layer.
2.  **Mocking**: Use mocking libraries to isolate tests. For backend tests, mock database calls to avoid hitting the actual database. For frontend tests, mock API calls.
3.  **CI**: Ensure all tests are run as part of the CI/CD pipeline. A build should fail if tests fail.

---

## Project Planning & Collaboration

### Task Breakdown
- **Epics & Stories**: Before implementing a new feature (epic), break it down into smaller user stories and then into technical tasks.
- **Task Definition**: Each task should have a clear description, acceptance criteria, and an estimated effort.

### Branching Strategy
- **GitFlow**: Use a GitFlow-like branching model:
  - `main`: Contains production-ready code.
  - `develop`: The primary development branch. All feature branches are merged into `develop`.
  - `feature/<feature-name>`: Branches for new features. Branched from `develop`.
  - `fix/<fix-name>`: Branches for bug fixes.

### Pull Requests (PRs)
- **Mandatory PRs**: All code changes must be submitted via a Pull Request to the `develop` branch.
- **PR Template**: Use a PR template that includes a summary of changes, testing steps, and a link to the relevant task.
- **Code Review**: At least one other developer must review and approve a PR before it can be merged.

### Progress Reporting
A progress report should be included at the end of each major task or at the end of the day.

- **Task**: [Name of the task or feature]
- **Status**: [In Progress | Completed | Blocked]
- **Completed This Period**:
  - [List of specific accomplishments]
- **Planned for Next Period**:
  - [List of next steps]
- **Blockers/Challenges**:
  - [Any issues impeding progress]
- **Dependencies**:
  - [Dependencies on other tasks or team members]
- **Screenshots/Demos**:
  - [Link to screenshots or a short video if applicable]
---

## Additional Notes
- **Code Style**: The project is configured with ESLint and Prettier. Ensure code is formatted before committing.
- **Documentation**: Keep all documentation, including this file and the `README.md`, up-to-date. Add inline comments for complex logic.
- **Collaboration**: Use the generator components for structured project planning and brainstorming.