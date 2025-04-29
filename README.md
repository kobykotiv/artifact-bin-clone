# Artifact Bin

A personal code snippet and project idea management application built with React, Bun, and IndexedDB for local storage. This progressive web app (PWA) allows you to store, edit, organize your code snippets, and generate/manage project ideas, all while working entirely within your browser.

## Features

- Create and edit code snippets with syntax highlighting
- **Generate and manage collaborative project ideas**
  - Define application type, data model, user roles, features
  - Add problem statements, customer details
  - **Generate pseudocode based on project configuration**
  - Fork existing project ideas
  - Share project ideas (basic link sharing)
- Organize artifacts by language or type (`project-generator`)
- Full offline support (PWA)
- Export all data as a ZIP bundle
- Import previously exported data
- Local storage with IndexedDB
- Install as a standalone app on your device

## Getting Started

### Installation

```bash
bun install
```

### Development

```bash
bun dev
```

### Production Build

```bash
bun run build
```

### Run Production Server

```bash
bun start
```

## Using the Project Generator

1.  Click the "New Project Idea" button.
2.  Fill in the details in the "Generator" tab (name, description, type, features, problem, customers, etc.).
3.  Optionally, use the "Generate Random Business App Idea" button for inspiration.
4.  Switch to the "Pseudocode" tab to view or generate pseudocode based on your selections.
5.  Use the "Collaboration" tab to view project details, fork the project, save the current state, or get a shareable link.
6.  Project ideas are saved as artifacts with the language type `project-generator`.

## Installing as a PWA

Artifact Bin can be installed as a standalone app on your device:

1. Open the app in a supported browser (Chrome, Edge, Safari, etc.)
2. You'll see an "Install App" prompt - click "Install"
3. On some browsers, you may need to use the browser menu:
   - Chrome/Edge: Click the three dots menu → "Install Artifact Bin"
   - Safari on iOS: Tap the share button → "Add to Home Screen"

Once installed, the app will run like a native application with its own window and can be used offline.

## Data Portability

Artifact Bin allows you to export all your data (including snippets and project ideas) as a ZIP file and import it back later. This is useful for:

- Backing up your artifacts
- Transferring artifacts between devices
- Sharing artifact collections with others

To export your data, click on the "Export" button in the header. To import, click "Import" and select a previously exported ZIP file.

## Privacy

All data is stored locally on your device using IndexedDB. No data is sent to any servers.

## Technologies Used

- [React](https://reactjs.org/)
- [Bun](https://bun.sh)
- [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Monaco Editor](https://microsoft.github.io/monaco-editor/)

## Acknowledgements

- Icons used in this project: <a href="https://www.flaticon.com/free-icons/generic" title="generic icons">Generic icons created by ViconsDesign - Flaticon</a>, [Lucide Icons](https://lucide.dev/)

## License

MIT
