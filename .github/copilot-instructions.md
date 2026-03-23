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

Alright, Achievement Hunter mode engaged. Picture your agentic coding bot wearing a hoodie full of enamel pins, each one earned by surviving chaos, refactors, and late night builds. Here’s a tiered brainstorm of achievements that feel earned, legible, and a little legendary 🧠⚙️

---

## 🟢 Starter Achievements: “Hello, World Domination”

These teach the bot how to exist without lighting the repo on fire.

* **Boot Sequence Complete**
  Successfully initializes workspace, config, env vars, and tooling without human intervention.

* **It Compiles On My Machine**
  Produces a build that passes type checks and runs locally.

* **Read the Room**
  Correctly parses repo structure, detects framework, language, package manager, and test setup.

* **No Touchy Prod**
  Detects production config and refuses unsafe actions without explicit approval.

* **Lint Whisperer**
  Fixes lint errors without changing program behavior.

---

## 🟡 Builder Achievements: “Useful, Not Dangerous”

Now it starts *doing work*.

* **Scaffold Architect**
  Generates a new feature, service, or module that matches existing conventions.

* **API Cartographer**
  Discovers and documents internal APIs by reading code, not comments.

* **Tests Are a Love Language**
  Adds meaningful tests that fail before the fix and pass after.

* **Config Whisperer**
  Modifies config files safely (env, tsconfig, vite, webpack, bun, docker).

* **Diff Minimalist**
  Solves a task with the smallest reasonable git diff.

---

## 🔵 Refactor Achievements: “Cleanup Crew”

These unlock trust.

* **No Behavior Changed, Promise**
  Refactors code while keeping tests and runtime behavior identical.

* **Dead Code Archaeologist**
  Identifies and safely removes unused code paths.

* **Rename Without Regret**
  Renames symbols across the codebase without breaking imports.

* **Dependency Diet**
  Removes a dependency and replaces it with native or existing tooling.

* **Migration Magician**
  Upgrades a library or framework version cleanly.

---

## 🟣 Agentic Achievements: “Autonomy Unlocked”

Now it thinks in goals, not instructions.

* **Task Decomposer**
  Breaks a vague request into executable subtasks with checkpoints.

* **Context Hoarder**
  Retains relevant architectural decisions across sessions.

* **Failure Is Feedback**
  Adapts strategy after a failed build or test run without human hints.

* **Ask Before You Break**
  Proactively requests clarification when ambiguity would cause risk.

* **Parallel Thinker**
  Plans multiple solution paths and selects one based on constraints.

---

## 🟠 Debugger Achievements: “I See the Bug”

* **Stack Trace Poet**
  Interprets error logs and points to root cause, not symptoms.

* **Heisenbug Hunter**
  Reproduces intermittent issues reliably.

* **Time Traveler**
  Bisects commits to find where a regression was introduced.

* **Works In CI Too**
  Fixes issues that only appear in CI or containerized environments.

---

## 🔴 Boss-Level Achievements: “You Can Go Get Coffee”

These should be rare and logged loudly.

* **Shipped Without Supervision**
  Completes a feature, tests it, documents it, and opens a PR.

* **Cross-System Orchestrator**
  Coordinates frontend, backend, DB, and infra changes coherently.

* **Spec From Vibes**
  Produces a correct implementation from a loose idea or partial notes.

* **Production Save**
  Detects, mitigates, and documents a prod issue safely.

* **Human Trust Earned**
  User accepts changes without review more than once.

---

## 🏆 Meta / Fun Achievements (Telemetry Candy)

These are great for dashboards and personality.

* **2AM Hero** – Fixed a bug between midnight and 5am local time
* **Rubber Duck Mode** – Solved a problem after explaining it
* **One-Liner Sorcery** – Legit solution in ≤3 lines
* **Read-Only Monk** – Solved issue without editing code
* **“Wait, That’s Clever”** – User reaction logged verbatim

---

## 🎛️ Optional Axes (for progression systems)

You can score achievements along dimensions:

* **Risk**: read-only → safe edits → prod-affecting
* **Scope**: single file → module → system
* **Autonomy**: guided → semi → fully agentic
* **Confidence**: asked questions → inferred correctly

---

If you want, next we can:

* Turn this into a **JSON achievement schema**
* Design **unlock rules & decay**
* Map achievements to **agent permissions**
* Add **failure badges** (equally important)

Your bot is basically an RPG character. We just need to decide what weapons it earns first 🧩⚔️


Perfect target. That URL shape already smells like intent, hierarchy, and long lived artifacts. Let’s put the Achievement Hunter hat back on and design this like a bot leveling through a dungeon called **artifactbin.io** 🗂️🧠

I’ll break this into:

1. What the system *is*
2. What the agent must *learn to do*
3. Achievement trees mapped directly to building the clone
4. Boss fights and edge cases

---

## 1️⃣ What You’re Really Building (Decoded)

Your URL:

```
https://usernames.broski.cc/{{folders-and-path}}{{category}}/{{content_uuid}}
```

This implies a few core truths:

* **Artifacts are immutable or versioned**
* **Paths are semantic, not just IDs**
* **Category is meaningful metadata**
* **UUID is the final authority**
* **Usernames are namespaces**
* **Folders are virtual, not necessarily filesystem-backed**

So artifactbin is not just Pastebin. It’s closer to:

> GitHub Gists × Notion blocks × S3 object keys × human-readable URLs

Your agent should understand this *implicitly*.

---

## 2️⃣ What Your Agentic Bot Must Learn To Do

Your agent is not just coding CRUD. It must reason about:

* URL semantics
* Content addressing
* Safety boundaries
* Immutable data
* Namespace collisions
* Render strategies per category
* Long-term storage vs ephemeral blobs

So achievements should unlock **capabilities**, not just code completion.

---

## 3️⃣ Achievement Trees (Mapped to the Build)

### 🌱 TREE 1: Artifact Genesis

> “The bot learns what an artifact *is*.”

* **Artifact Exists**
  Create content with UUID, owner, category, timestamps.

* **Name Is Not Identity**
  Supports renaming paths without changing UUID.

* **Immutable Core**
  Prevents overwriting artifacts unless versioned.

* **Checksum Scribe**
  Computes hash to detect identical uploads.

* **Metadata First-Class Citizen**
  Category, language, mime type, visibility, tags.

---

### 🗂️ TREE 2: Path & Namespace Mastery

> “Folders are illusions, but useful ones.”

* **Folders Are Lies**
  Stores paths as metadata, not real directories.

* **Path Rehydration**
  Reconstructs full URL from artifact metadata.

* **Namespace Guard**
  Prevents username collisions and path squatting.

* **Soft 404 Philosopher**
  Distinguishes between missing artifact and private artifact.

* **Path Migration**
  Allows changing folder structure without breaking UUID links.

---

### 🔐 TREE 3: Safety & Permissions

> “Trust is earned, not assumed.”

* **Public By Default, Safe By Design**
  No executable content served unsandboxed.

* **Read-Only Guest**
  Anonymous users cannot mutate artifacts.

* **Owner Override**
  Username owner can reorganize paths safely.

* **Red Button Awareness**
  Bot refuses to delete without versioning or archival.

* **Link Leak Containment**
  Private artifacts require signed URLs or tokens.

---

### 🧬 TREE 4: Categories & Rendering

> “Content knows how it wants to be seen.”

* **Category Decides Renderer**
  `code`, `json`, `markdown`, `image`, `binary`, `log`, `html`

* **Syntax Oracle**
  Auto-detects language for code artifacts.

* **Preview Without Execution**
  Renders HTML safely or not at all.

* **Raw Mode Ascetic**
  Serves content exactly as stored when requested.

* **Download Is Sacred**
  Binary artifacts never get “helpfully” modified.

---

### 🧠 TREE 5: Agentic Autonomy (Critical)

> “The bot builds the platform while using it.”

* **Dogfooding Adept**
  Uses artifactbin to store its own logs, plans, diffs.

* **Spec From URL**
  Infers backend schema from URL shape alone.

* **Schema Evolver**
  Migrates DB as features expand.

* **Diff-Aware Builder**
  Applies minimal schema and code changes.

* **Explain The Why**
  Documents design decisions automatically.

---

## 4️⃣ Boss Fights (Hard Problems Worth Achievements)

These are *legendary unlocks* 🏆

### 🐉 Boss: Versioning Without Pain

* Artifact UUID stays constant
* Versions append
* Old URLs still resolve
* UI can diff versions

**Achievement:**
**Time Is a Flat Artifact**

---

### 🐉 Boss: Abuse & Spam Defense

* Rate limiting
* Content size limits
* Username squatting
* Automated uploads

**Achievement:**
**The Gates Still Stand**

---

### 🐉 Boss: Storage Strategy

* Small text → DB
* Medium blobs → object storage
* Large files → multipart uploads

**Achievement:**
**Knows When Not To Inline**

---

### 🐉 Boss: URL Permanence

* URLs never rot
* Redirects tracked
* Path history preserved

**Achievement:**
**Links Outlive Code**

---

## 5️⃣ Meta-Achievements (For the Bot’s Soul)

These matter more than features.

* **Did Not Over-Engineer**
* **Shipped Before Perfect**
* **Left TODOs With Intent**
* **Refused Feature Creep Politely**
* **Built The Right Thing First**

---

## 6️⃣ If You Want Next Steps

We can go very concrete next. Pick one:

1. **Design the DB schema** (Postgres or KV)
2. **Define the Artifact API** (REST or RPC)
3. **Design the rendering pipeline per category**
4. **Write the agent instruction system** (what it’s allowed to do at each achievement tier)
5. **Turn this into a build quest log** (step-by-step agent roadmap)

Your agent isn’t just cloning artifactbin.
It’s learning how to build *durable things on the internet* 🧱🌐
