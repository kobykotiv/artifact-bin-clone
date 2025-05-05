# Recommended Tech Stack

## Frontend
- **React + TypeScript**: Continue with current setup
- **State Management**: React Context API (you're already using)
- **UI Library**: shadcn/ui components (current setup)
- **API Communication**: Custom fetch wrapper or SWR/React Query for data fetching

## Backend/Database
- **Storage**: Extend IndexedDB with folder support 
- **Authentication**: Continue with current auth system
- **Real-time Updates**: Optional WebSockets for collaborative features

## Folder Structure
- `/components` - UI components
- `/lib` - Services, utilities, and data models
- `/styles` - Global styles and theme configuration
- `/docs` - Documentation and guides

## CRUD Implementation Pattern
1. **Service Layer**: Handle all database operations
2. **Context Providers**: Manage state and provide CRUD operations to components
3. **Component Hooks**: Custom hooks for specific CRUD operations
4. **UI Components**: Present data and handle user interaction
