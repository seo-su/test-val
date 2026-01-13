# GameMaster Assistant

A SaaS application designed to help Dungeon Masters prepare and organize their D&D session notes. Built specifically for **Curse of Strahd: Reloaded** by DragnaCarta, but extensible for any campaign.

## Features

### Campaign Content Browser
- Browse the complete Curse of Strahd: Reloaded campaign
- Navigate by Acts, Arcs, and Chapters
- Search across all content
- Preview content in a clean, readable format

### Content Synthesis
- Transform chapter content into organized, session-ready notes
- Automatically extract:
  - NPCs with descriptions and roleplay tips
  - Locations with features and descriptions
  - Encounters with tactics
  - Treasures and rewards
  - Key points and DM reminders

### Custom Templates
- Upload your own `.md` template files
- Create templates directly in the app
- Use placeholders like `{{title}}` and `{{summary}}`
- Apply templates when synthesizing content

### Session Notes Management
- Create, edit, and save session notes
- Auto-save functionality
- Export notes as Markdown files
- Organize by chapter/arc

## Tech Stack

- **Backend**: Node.js, Express, TypeScript
- **Frontend**: React, Vite, TypeScript, TailwindCSS
- **Content Source**: GitHub API (DragnaCarta/Curse-of-Strahd-Reloaded)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd gamemaster-assistant
```

2. Install all dependencies:
```bash
npm run install:all
```

3. Start development servers:
```bash
npm run dev
```

This will start:
- Backend API at `http://localhost:3001`
- Frontend at `http://localhost:3000`

### Production Build

```bash
npm run build
npm start
```

## API Endpoints

### Chapters
- `GET /api/chapters` - Get content structure (acts, chapters, appendices)
- `GET /api/chapters/content?path=<path>` - Get chapter content
- `POST /api/chapters/synthesize` - Synthesize chapter into notes
- `GET /api/chapters/search?q=<query>` - Search chapters

### Templates
- `GET /api/templates` - List all templates
- `GET /api/templates/:id` - Get template by ID
- `POST /api/templates` - Create new template
- `POST /api/templates/upload` - Upload .md template file
- `DELETE /api/templates/:id` - Delete template

### Session Notes
- `GET /api/sessions` - List all session notes
- `GET /api/sessions/:id` - Get session note by ID
- `POST /api/sessions` - Create session note
- `PUT /api/sessions/:id` - Update session note
- `DELETE /api/sessions/:id` - Delete session note
- `GET /api/sessions/:id/export?format=<markdown|json>` - Export session note

## Project Structure

```
gamemaster-assistant/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Request handlers
│   │   ├── services/        # Business logic
│   │   ├── routes/          # API routes
│   │   ├── types/           # TypeScript types
│   │   └── index.ts         # Entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API client
│   │   ├── types/           # TypeScript types
│   │   ├── styles/          # CSS styles
│   │   ├── App.tsx          # Main app component
│   │   └── main.tsx         # Entry point
│   └── package.json
├── package.json             # Root package.json
└── README.md
```

## Usage Guide

### 1. Browsing Chapters
Navigate to the **Chapters** page to explore the campaign content. Click on any chapter to preview its content. Use the search bar to find specific content.

### 2. Synthesizing Content
Go to the **Synthesize** page, select a chapter and optionally a template, then click "Synthesize". The app will:
- Parse the chapter content
- Extract NPCs, locations, encounters, and treasures
- Format everything into structured notes
- Allow you to view in structured or markdown format

### 3. Managing Templates
On the **Templates** page you can:
- View the default template
- Upload your own `.md` templates
- Create new templates with the built-in editor

### 4. Session Notes
Use the **Sessions** page to:
- View all your saved session notes
- Create new blank sessions
- Edit existing notes with the markdown editor
- Export notes for offline use

## Credits

- **Curse of Strahd: Reloaded** by [DragnaCarta](https://github.com/DragnaCarta/Curse-of-Strahd-Reloaded)
- Icons by [Lucide](https://lucide.dev/)
- Fonts: Cinzel and Crimson Text from Google Fonts

## License

MIT License - Feel free to use and modify for your own campaigns!
