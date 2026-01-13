import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import routes from './routes/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const isProduction = process.env.NODE_ENV === 'production';

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// API routes
app.use('/api', routes);

// Serve static files in production
if (isProduction) {
  // Try multiple possible locations for static files
  const publicPaths = [
    path.join(__dirname, '..', 'public'),
    path.join(__dirname, 'public'),
    path.join(process.cwd(), 'public'),
    path.join(process.cwd(), 'gamemaster-assistant', 'backend', 'public')
  ];

  let publicPath = publicPaths[0];
  for (const p of publicPaths) {
    try {
      if (require('fs').existsSync(p)) {
        publicPath = p;
        console.log(`Serving static files from: ${p}`);
        break;
      }
    } catch {}
  }

  app.use(express.static(publicPath));

  // SPA fallback - serve index.html for all non-API routes
  app.get('*', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
  });
} else {
  // Development: show API info
  app.get('/', (req, res) => {
    res.json({
      name: 'GameMaster Assistant API',
      version: '1.0.0',
      description: 'API for D&D GameMaster session preparation and note-taking',
      endpoints: {
        health: 'GET /api/health',
        chapters: {
          list: 'GET /api/chapters',
          content: 'GET /api/chapters/content?path=<path>',
          synthesize: 'POST /api/chapters/synthesize',
          search: 'GET /api/chapters/search?q=<query>'
        },
        templates: {
          list: 'GET /api/templates',
          get: 'GET /api/templates/:id',
          create: 'POST /api/templates',
          upload: 'POST /api/templates/upload',
          delete: 'DELETE /api/templates/:id'
        },
        sessions: {
          list: 'GET /api/sessions',
          get: 'GET /api/sessions/:id',
          create: 'POST /api/sessions',
          update: 'PUT /api/sessions/:id',
          delete: 'DELETE /api/sessions/:id',
          export: 'GET /api/sessions/:id/export?format=<markdown|json>'
        }
      }
    });
  });
}

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err.message);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║     🎲 GameMaster Assistant API                              ║
║     Version 1.0.0                                            ║
║                                                              ║
║     Server running on http://0.0.0.0:${PORT}                    ║
║                                                              ║
║     Ready to help prepare your D&D sessions!                 ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
  `);
});

export default app;
