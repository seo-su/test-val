import { Router } from 'express';
import multer from 'multer';
import {
  getContentStructure,
  getChapterContent,
  synthesizeChapter,
  searchContent
} from '../controllers/chapterController.js';
import {
  getTemplates,
  getTemplate,
  uploadTemplate,
  createTemplate,
  deleteTemplate
} from '../controllers/templateController.js';
import {
  getSessionNotes,
  getSessionNote,
  createSessionNote,
  updateSessionNote,
  deleteSessionNote,
  exportSessionNote
} from '../controllers/sessionController.js';

const router = Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/markdown' || file.originalname.endsWith('.md')) {
      cb(null, true);
    } else {
      cb(new Error('Only .md files are allowed'));
    }
  }
});

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Chapter routes
router.get('/chapters', getContentStructure);
router.get('/chapters/content', getChapterContent);
router.post('/chapters/synthesize', synthesizeChapter);
router.get('/chapters/search', searchContent);

// Template routes
router.get('/templates', getTemplates);
router.get('/templates/:id', getTemplate);
router.post('/templates', createTemplate);
router.post('/templates/upload', upload.single('template'), uploadTemplate);
router.delete('/templates/:id', deleteTemplate);

// Session notes routes
router.get('/sessions', getSessionNotes);
router.get('/sessions/:id', getSessionNote);
router.post('/sessions', createSessionNote);
router.put('/sessions/:id', updateSessionNote);
router.delete('/sessions/:id', deleteSessionNote);
router.get('/sessions/:id/export', exportSessionNote);

export default router;
