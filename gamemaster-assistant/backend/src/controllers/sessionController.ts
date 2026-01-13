import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { SessionNote } from '../types/index.js';

// In-memory storage for session notes (in production, use a database)
const sessionNotes: Map<string, SessionNote> = new Map();

export async function getSessionNotes(req: Request, res: Response) {
  try {
    const notesList = Array.from(sessionNotes.values())
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

    res.json({
      success: true,
      data: notesList
    });
  } catch (error) {
    console.error('Error getting session notes:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get session notes'
    });
  }
}

export async function getSessionNote(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const note = sessionNotes.get(id);

    if (!note) {
      return res.status(404).json({
        success: false,
        error: 'Session note not found'
      });
    }

    res.json({
      success: true,
      data: note
    });
  } catch (error) {
    console.error('Error getting session note:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get session note'
    });
  }
}

export async function createSessionNote(req: Request, res: Response) {
  try {
    const { title, chapter, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        error: 'Title and content are required'
      });
    }

    const now = new Date();
    const note: SessionNote = {
      id: uuidv4(),
      title,
      chapter: chapter || 'General',
      content,
      createdAt: now,
      updatedAt: now
    };

    sessionNotes.set(note.id, note);

    res.json({
      success: true,
      data: note
    });
  } catch (error) {
    console.error('Error creating session note:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create session note'
    });
  }
}

export async function updateSessionNote(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { title, chapter, content } = req.body;

    const existingNote = sessionNotes.get(id);
    if (!existingNote) {
      return res.status(404).json({
        success: false,
        error: 'Session note not found'
      });
    }

    const updatedNote: SessionNote = {
      ...existingNote,
      title: title || existingNote.title,
      chapter: chapter || existingNote.chapter,
      content: content || existingNote.content,
      updatedAt: new Date()
    };

    sessionNotes.set(id, updatedNote);

    res.json({
      success: true,
      data: updatedNote
    });
  } catch (error) {
    console.error('Error updating session note:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update session note'
    });
  }
}

export async function deleteSessionNote(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (!sessionNotes.has(id)) {
      return res.status(404).json({
        success: false,
        error: 'Session note not found'
      });
    }

    sessionNotes.delete(id);

    res.json({
      success: true,
      message: 'Session note deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting session note:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete session note'
    });
  }
}

export async function exportSessionNote(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { format = 'markdown' } = req.query;

    const note = sessionNotes.get(id);
    if (!note) {
      return res.status(404).json({
        success: false,
        error: 'Session note not found'
      });
    }

    if (format === 'markdown') {
      res.setHeader('Content-Type', 'text/markdown');
      res.setHeader('Content-Disposition', `attachment; filename="${note.title.replace(/\s+/g, '_')}.md"`);
      res.send(note.content);
    } else if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${note.title.replace(/\s+/g, '_')}.json"`);
      res.json(note);
    } else {
      res.status(400).json({
        success: false,
        error: 'Unsupported format. Use "markdown" or "json"'
      });
    }
  } catch (error) {
    console.error('Error exporting session note:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export session note'
    });
  }
}
