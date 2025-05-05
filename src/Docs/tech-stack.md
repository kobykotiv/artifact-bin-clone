# Artifact Bin Tech Stack for CRUD Management

## Overview

Artifact Bin uses a modern, component-based architecture for managing artifacts efficiently. The application is structured around a three-panel IDE-style interface with specialized components for different artifact types.

## Frontend Architecture

### Core Components
- **Dashboard**: Central container component using three-panel layout
- **FolderExplorer**: Left sidebar for organizing artifacts by category
- **PromptSidebar**: Right sidebar for Claude AI integration
- **ArtifactViewer/Editor**: Central panel for viewing and editing artifacts

### State Management
- React's Context API for global state
- Component-specific state with useState for local UI state
- Local storage for persistence of user preferences

### UI Components
- Shadcn/UI library for consistent design
- Custom components for specialized artifact types
- Responsive design with Tailwind CSS

## Data Architecture

### Artifact Management
- Each artifact has a standardized base structure with specialized content
- Common fields: id, title, language, content, updatedAt
- Specialized fields based on artifact type

### Storage Strategy
- IndexedDB for local storage in browser
- Optional server synchronization
- Export/import for data portability

## Artifact Types

### Code Artifacts
- Standard code snippets with syntax highlighting
- Language-specific features and templates

### Project Specifications
- Structured JSON data for project details
- Custom UI for editing and viewing

### Business Plans
- Marketing, fundraising, budget plans
- Interactive components for business strategy

### Sprint Plans
- Task tracking and sprint management
- Timeline visualization

## Claude Integration

### Prompt Library
- Templated prompts with variable support using {{variable}} syntax
- Options for variables with {{variable-option1-option2}} syntax
- Categories of prompts for different use cases

### Conversation History
- Persistent conversation logs
- Context-aware responses based on artifact type

## Future Extensions

### Version Control
- Git-inspired version history for artifacts
- Branching and merging for collaborative work

### Real-time Collaboration
- WebSocket integration for multi-user editing
- Presence indicators and commenting

### Enhanced Analytics
- Usage tracking and insights
- Performance metrics for optimizations
