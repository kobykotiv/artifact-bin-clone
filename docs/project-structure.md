# Project Structure

## Folders

- `/src`: Main source code
  - `/components`: React components
    - `/ui`: UI components from shadcn/ui
    - `/Dashboard`: Dashboard-specific components
  - `/lib`: Utilities, services and models
    - `/models`: MongoDB schema definitions
    - `/services`: Service layers (auth, db, etc)
    - `/utils`: Utility functions
  - `/styles`: Global CSS styles
  - `/pages`: (if using Next.js) Page components
  - `/app`: (if using Next.js App Router) App routes

## Key Features

- **Artifact Management**: Create, store, and organize code snippets and documents
- **Folder Organization**: Group artifacts into folders for better organization
- **Sharing**: Share folders with other users
- **Prompt Library**: Create and use templated prompts with variables
- **Business Plan Generation**: Generate various business documents

## Tech Stack

- Frontend: React with TypeScript
- State Management: Context API / Zustand
- UI Components: shadcn/ui
- Backend: Node.js with Express
- Database: MongoDB with Mongoose
- Authentication: JWT
- File Storage: AWS S3 or similar
