import express from 'express';
import cors from 'cors';
import routes from './routes/index.js';

const app = express();
const PORT = process.env.PORT || 3001;

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

// Root endpoint
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

app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║     🎲 GameMaster Assistant API                              ║
║     Version 1.0.0                                            ║
║                                                              ║
║     Server running on http://localhost:${PORT}                  ║
║                                                              ║
║     Ready to help prepare your D&D sessions!                 ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
  `);
});

export default app;
