# Build Quest: Artifact Bin Clone
## Achievement-Driven Development Plan

This document maps the **Achievement System** to concrete build tasks for the artifact-bin clone. Each quest stage unlocks new achievements and builds on prior work.

---

## 🎯 Current State Assessment

### ✅ Completed
- Project scaffolded (Vite + React + TypeScript + Bun)
- Basic dashboard layout with tabs (Home, Community, My Artifacts)
- Community tab (backend + frontend) - fully functional
- Community service layer (localStorage persistence)
- API endpoints for posts, reactions, comments, notifications, activity
- **DBService with artifact CRUD operations** (`/src/lib/services/db.ts`)
  - `createArtifact()`, `getArtifact()`, `updateArtifact()`, `deleteArtifact()`, `getAllArtifacts()`
  - Folder operations: `createFolder()`, `getFolder()`, `updateFolder()`, `deleteFolder()`
  - Project operations: `createProject()`, `getProject()`, etc.
- **Versioning service** (`/src/lib/versioning.ts`)
  - `createVersion()`, `getVersions()`, `getVersion()`
  - `updateArtifactAndCreateVersion()` wrapper
- **Artifact model** (`/src/lib/models/Artifact.ts`) - Mongoose-based (to be adapted)
- **MyArtifactsSection component** (`/src/components/Dashboard/MyArtifactsSection.tsx`)
  - FolderExplorer + ArtifactList structure
  - Props for artifacts, folders, selection, and actions
- Achievement system documented (`/docs/achievement-system.md`)
- Architecture spec documented (`/docs/artifact-architecture.md`)

### 🚧 Immediate Priorities
1. **Create API endpoints for artifacts** (`/api/artifacts/...`)
2. **Build category-specific renderers** (Code, JSON, Markdown, Image, etc.)
3. **Wire MyArtifactsSection to live data** (fetch from dbService)
4. **Add semantic URL routing** (`/[username]/[...path]`)
5. **Implement search and discovery** (filters, tags, full-text)

---

## 📋 Quest Stages

### **Stage 1: Foundation** (Starter Tier) ✅ MOSTLY COMPLETE
**Goal**: Get the artifact system's foundation working  
**Target Achievements**: `boot-sequence` ✅, `it-compiles` ✅, `read-the-room` ✅, `no-touchy-prod` ✅

#### Tasks

**1.1 Create Artifact Model** ✅ DONE (needs refinement)
- [x] ~~Create `/src/lib/models/Artifact.ts`~~ EXISTS (Mongoose-based)
- [x] ~~Define TypeScript interfaces~~ EXISTS (ArtifactData interface)
- [ ] **TO DO**: Align ArtifactData with architecture spec
  - Add `category` field (code, json, markdown, image, binary, log, html, text)
  - Add `path` and `slug` for semantic URLs
  - Add `visibility` (public, private, unlisted)
  - Add `contentHash` for integrity checks
  - Add `sizeBytes` for storage tracking
- [ ] Add validation helpers (category enum, visibility enum)
- **Achievement**: `boot-sequence` ✅ (understand existing models pattern)

**1.2 ArtifactService (localStorage persistence)** ✅ DONE
- [x] ~~Create artifact service~~ EXISTS in `/src/lib/services/db.ts` as `DBService`
- [x] ~~CRUD methods~~ ALL IMPLEMENTED
  - `createArtifact()` ✅
  - `getArtifact()` ✅
  - `updateArtifact()` ✅
  - `deleteArtifact()` ✅
  - `getAllArtifacts()` ✅
- [x] ~~Versioning~~ EXISTS in `/src/lib/versioning.ts`
  - `createVersion()` ✅
  - `getVersions()` ✅
  - `updateArtifactAndCreateVersion()` ✅
- [x] ~~localStorage persistence~~ IMPLEMENTED
- [x] ~~UUID generation~~ IMPLEMENTED (`crypto.randomUUID()`)
- [ ] **TO DO**: Add content hashing (SHA-256)
- **Achievement**: `scaffold-architect` ✅ (followed existing patterns)

**1.3 Build Artifact API Endpoints** 🚧 NEXT UP
- [ ] Create `/src/pages/api/artifacts/index.ts` (list/create)
- [ ] Create `/src/pages/api/artifacts/[id].ts` (get/update/delete)
- [ ] Create `/src/pages/api/artifacts/[id]/versions.ts` (version history)
- [ ] Wire all endpoints to `dbService`
- [ ] Add error handling and validation
- **Achievement**: `api-cartographer` (map existing API patterns)

**1.4 Test the Foundation**
- [x] ~~Run `bun run build`~~ WORKS (confirmed)
- [x] ~~Start dev server~~ NO CRASHES (confirmed)
- [ ] Test artifact creation via API (Postman/curl)
- [ ] Verify localStorage persistence
- **Achievement**: `it-compiles` ✅

---

### **Stage 2: Storage & Content** (Builder Tier)
**Goal**: Handle different content types safely  
**Target Achievements**: `scaffold-architect`, `config-whisperer`, `tests-are-love`

#### Tasks

**2.1 Content Storage Strategy**
- [ ] Add storage helper in `/src/lib/utils/storage.ts`:
  - `shouldStoreInline(sizeBytes): boolean` (< 100KB inline, else external)
  - `calculateHash(content): string` (SHA-256)
  - `estimateSizeBytes(content): number`
- [ ] Implement inline storage (store content in Artifact object)
- [ ] Stub external storage (S3/R2) for future:
  ```typescript
  interface StorageBackend {
    upload(key: string, content: Blob): Promise<string>
    download(url: string): Promise<Blob>
    delete(url: string): Promise<void>
  }
  ```
- **Achievement**: `config-whisperer` (understand storage trade-offs)

**2.2 Category-Specific Validators**
- [ ] Create `/src/lib/validators/artifact.ts`
- [ ] Add validators for each category:
  - `validateCode(content, language): ValidationResult`
  - `validateJSON(content): ValidationResult`
  - `validateMarkdown(content): ValidationResult`
  - `validateImage(blob): ValidationResult`
  - `validateBinary(blob): ValidationResult`
- [ ] Integrate validators into `artifactService.createArtifact()`
- **Achievement**: `scaffold-architect`

**2.3 Add Tests**
- [ ] Create `/src/lib/services/__tests__/artifact.test.ts`
- [ ] Test artifact CRUD operations
- [ ] Test versioning logic
- [ ] Test content hashing
- [ ] Test storage size thresholds
- **Achievement**: `tests-are-love`

---

### **Stage 3: Rendering Pipeline** (Builder Tier)
**Goal**: Display artifacts beautifully by category  
**Target Achievements**: `scaffold-architect`, `diff-minimalist`

#### Tasks

**3.1 Create Renderer Components**
- [ ] Create `/src/components/Renderers/CodeRenderer.tsx`
  - Syntax highlighting (use Prism or Shiki)
  - Line numbers
  - Copy button
- [ ] Create `/src/components/Renderers/JSONRenderer.tsx`
  - Pretty print with collapsible nodes
  - Search/filter
- [ ] Create `/src/components/Renderers/MarkdownRenderer.tsx`
  - Use `react-markdown` or similar
  - Syntax highlighting for code blocks
- [ ] Create `/src/components/Renderers/ImageRenderer.tsx`
  - Lazy load images
  - Zoom/lightbox
- [ ] Create `/src/components/Renderers/BinaryRenderer.tsx`
  - File info (size, type, hash)
  - Download button
- [ ] Create `/src/components/Renderers/HTMLRenderer.tsx`
  - Sandboxed iframe
- [ ] Create `/src/components/Renderers/TextRenderer.tsx`
  - Plain text with line wrap toggle
- [ ] Create `/src/components/Renderers/LogRenderer.tsx`
  - Tail view
  - Search/filter
  - Line highlighting

**3.2 Renderer Router**
- [ ] Create `/src/components/Renderers/ArtifactRenderer.tsx`
- [ ] Implement category-based routing:
  ```tsx
  const renderContent = (artifact: Artifact) => {
    switch (artifact.category) {
      case 'code': return <CodeRenderer artifact={artifact} />
      case 'json': return <JSONRenderer artifact={artifact} />
      case 'markdown': return <MarkdownRenderer artifact={artifact} />
      // ... etc
    }
  }
  ```
- **Achievement**: `diff-minimalist` (minimal, focused changes)

**3.3 Wire to MyArtifactsSection**
- [ ] Update `MyArtifactsSection.tsx` to fetch artifacts from API
- [ ] Display artifact list with metadata
- [ ] Render selected artifact with `ArtifactRenderer`
- [ ] Add loading/error states
- **Achievement**: `scaffold-architect`

---

### **Stage 4: Path & Namespace** (Refactor Tier)
**Goal**: Implement semantic URL routing  
**Target Achievements**: `api-cartographer`, `no-behavior-changed`, `rename-without-regret`

#### Tasks

**4.1 Path Resolution Service**
- [ ] Create `/src/lib/services/path.ts`
- [ ] Implement path parsing:
  ```typescript
  interface ParsedPath {
    username: string
    folders: string[]
    category: string
    uuid: string
    slug?: string
  }
  
  function parsePath(url: string): ParsedPath
  ```
- [ ] Implement path building:
  ```typescript
  function buildPath(artifact: Artifact): string
  // Returns: /username/folder1/folder2/category/uuid
  ```
- [ ] Add path validation (no special chars, length limits)

**4.2 Dynamic Routing**
- [ ] Create `/src/pages/[username]/[...path].tsx` (catch-all route)
- [ ] Implement path resolution in page component:
  - Parse URL
  - Fetch artifact by username + path + uuid
  - Render with ArtifactRenderer
- [ ] Add 404 handling for invalid paths
- **Achievement**: `api-cartographer`

**4.3 Folder Management**
- [ ] Add folder operations to artifactService:
  - `listFolders(username): Promise<string[]>`
  - `moveArtifact(id, newPath): Promise<void>`
  - `renameFolder(oldPath, newPath): Promise<void>`
- [ ] Update MyArtifactsSection with folder tree UI
- **Achievement**: `rename-without-regret` (safe cross-file updates)

---

### **Stage 5: Search & Discovery** (Builder/Agentic Tier)
**Goal**: Make artifacts discoverable  
**Target Achievements**: `api-cartographer`, `task-decomposer`, `parallel-thinker`

#### Tasks

**5.1 Search API**
- [ ] Create `/src/pages/api/search.ts`
- [ ] Implement search logic:
  - Filter by username, category, tags
  - Full-text search in title/description/content
  - Sort by created_at, updated_at, accessed_at
- [ ] Add pagination (limit, offset)
- **Achievement**: `task-decomposer` (break down search requirements)

**5.2 Search UI**
- [ ] Create `/src/components/Dashboard/ArtifactSearch.tsx`
- [ ] Add search input with filters (category, tags)
- [ ] Display results grid/list
- [ ] Link results to artifact viewer
- [ ] Add to DashboardLayout as new tab
- **Achievement**: `parallel-thinker` (multiple UI patterns)

**5.3 Recent Activity**
- [ ] Track `accessed_at` in artifactService
- [ ] Create activity feed in MyArtifactsSection
- [ ] Show recent artifacts, edits, views
- **Achievement**: `context-hoarder` (retain state)

---

### **Stage 6: Versioning & History** (Refactor/Agentic Tier)
**Goal**: Track artifact changes over time  
**Target Achievements**: `no-behavior-changed`, `migration-magician`, `time-traveler`

#### Tasks

**6.1 Version Control Logic**
- [ ] Implement version creation in artifactService:
  - On update, create new version entry
  - Link to parent via `parent_id`
  - Set `is_latest = false` on old versions
- [ ] Add version listing API endpoint
- [ ] Add version comparison API endpoint
- **Achievement**: `time-traveler` (bisect versions)

**6.2 Version UI**
- [ ] Create `/src/components/Renderers/VersionHistory.tsx`
- [ ] Display version timeline
- [ ] Show diff between versions
- [ ] Allow rollback to previous version
- **Achievement**: `no-behavior-changed` (safe rollbacks)

**6.3 Content Diffing**
- [ ] Add diff library (e.g., `diff` or `react-diff-viewer`)
- [ ] Implement side-by-side diff view
- [ ] Highlight changes (additions, deletions)
- **Achievement**: `diff-minimalist`

---

### **Stage 7: Permissions & Auth** (Boss Tier)
**Goal**: Secure artifacts with access control  
**Target Achievements**: `no-touchy-prod`, `cross-system-orchestrator`, `production-save`

#### Tasks

**7.1 Authentication**
- [ ] Choose auth provider (Clerk, Supabase Auth, or NextAuth)
- [ ] Install and configure
- [ ] Add login/signup UI
- [ ] Protect API routes with middleware
- **Achievement**: `config-whisperer`

**7.2 Authorization**
- [ ] Implement visibility checks in artifactService:
  - Public: anyone can read
  - Unlisted: anyone with link can read
  - Private: only owner can read
- [ ] Add ownership checks (user can only edit their own)
- [ ] Add JWT token validation
- **Achievement**: `no-touchy-prod` (security best practices)

**7.3 User Management**
- [ ] Create user profile page
- [ ] Display user's artifacts
- [ ] Show storage usage and quota
- [ ] Add settings for default visibility
- **Achievement**: `cross-system-orchestrator` (frontend + backend + auth)

---

### **Stage 8: Performance & Polish** (Debugger/Boss Tier)
**Goal**: Make it fast and delightful  
**Target Achievements**: `heisenbug-hunter`, `works-in-ci`, `shipped-without-supervision`

#### Tasks

**8.1 Optimization**
- [ ] Add lazy loading for artifact list
- [ ] Implement infinite scroll
- [ ] Cache artifact data (React Query or SWR)
- [ ] Optimize bundle size (code splitting)
- **Achievement**: `dependency-diet`

**8.2 Error Handling**
- [ ] Add global error boundary
- [ ] Implement retry logic for failed API calls
- [ ] Add user-friendly error messages
- [ ] Log errors to monitoring service
- **Achievement**: `stack-trace-poet`

**8.3 Testing**
- [ ] Add E2E tests with Playwright
- [ ] Test critical flows (create, view, edit, delete artifact)
- [ ] Test auth flows
- [ ] Test edge cases (large files, invalid paths)
- **Achievement**: `heisenbug-hunter`

**8.4 CI/CD**
- [ ] Set up GitHub Actions
- [ ] Run tests on PR
- [ ] Deploy to Vercel/Netlify on merge
- [ ] Add build status badge to README
- **Achievement**: `works-in-ci`

**8.5 Documentation**
- [ ] Write README with setup instructions
- [ ] Document API endpoints
- [ ] Add JSDoc comments to key functions
- [ ] Create user guide
- **Achievement**: `shipped-without-supervision`

---

### **Stage 9: Advanced Features** (Boss Tier)
**Goal**: Differentiate from competitors  
**Target Achievements**: `spec-from-vibes`, `human-trust-earned`

#### Tasks

**9.1 Collaboration**
- [ ] Add sharing links
- [ ] Implement embed codes
- [ ] Add comments on artifacts
- [ ] Add reactions/likes
- **Achievement**: `cross-system-orchestrator`

**9.2 Export/Import**
- [ ] Export artifact as JSON
- [ ] Export folder as ZIP
- [ ] Import from file
- [ ] Import from URL
- **Achievement**: `migration-magician`

**9.3 Integrations**
- [ ] GitHub Gist import
- [ ] Pastebin import
- [ ] VS Code extension
- [ ] CLI tool for uploading
- **Achievement**: `spec-from-vibes`

**9.4 Analytics**
- [ ] Track artifact views
- [ ] Show trending artifacts
- [ ] User stats dashboard
- **Achievement**: `context-hoarder`

---

## 🏆 Achievement Tracker

### Starter Tier (5/5)
- [x] boot-sequence
- [x] it-compiles
- [x] read-the-room
- [x] no-touchy-prod
- [x] lint-whisperer

### Builder Tier (0/5)
- [ ] scaffold-architect
- [ ] api-cartographer
- [ ] tests-are-love
- [ ] config-whisperer
- [ ] diff-minimalist

### Refactor Tier (0/5)
- [ ] no-behavior-changed
- [ ] dead-code-archaeologist
- [ ] rename-without-regret
- [ ] dependency-diet
- [ ] migration-magician

### Agentic Tier (0/5)
- [ ] task-decomposer
- [ ] context-hoarder
- [ ] failure-is-feedback
- [ ] ask-before-break
- [ ] parallel-thinker

### Debugger Tier (0/4)
- [ ] stack-trace-poet
- [ ] heisenbug-hunter
- [ ] time-traveler
- [ ] works-in-ci

### Boss Tier (0/5)
- [ ] shipped-without-supervision
- [ ] cross-system-orchestrator
- [ ] spec-from-vibes
- [ ] production-save
- [ ] human-trust-earned

---

## 🎮 Next Action

**Immediate**: Start Stage 1, Task 1.1 - Create Artifact Model

Run the following command to begin:
```bash
# No command needed - I'll create the Artifact model next!
```

**After Each Task**: Update this document with checkmarks ✅ and notes on what was learned.

**After Each Stage**: Reflect on which achievements were earned and update the tracker.

**End Goal**: All stages complete, all boss-tier achievements unlocked, artifact-bin clone shipped to production.
