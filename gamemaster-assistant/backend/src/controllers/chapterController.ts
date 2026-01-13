import { Request, Response } from 'express';
import { fetchContentStructure, fetchChapterContent, searchChapters } from '../services/githubService.js';
import { synthesizeContent, formatForSession } from '../services/synthesisService.js';

export async function getContentStructure(req: Request, res: Response) {
  try {
    const structure = await fetchContentStructure();
    res.json({
      success: true,
      data: structure
    });
  } catch (error) {
    console.error('Error getting content structure:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch content structure'
    });
  }
}

export async function getChapterContent(req: Request, res: Response) {
  try {
    const { path } = req.query;

    if (!path || typeof path !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Chapter path is required'
      });
    }

    const content = await fetchChapterContent(path);
    res.json({
      success: true,
      data: {
        path,
        content
      }
    });
  } catch (error) {
    console.error('Error getting chapter content:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch chapter content'
    });
  }
}

export async function synthesizeChapter(req: Request, res: Response) {
  try {
    const { path, template, format = 'markdown' } = req.body;

    if (!path || typeof path !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Chapter path is required'
      });
    }

    const rawContent = await fetchChapterContent(path);
    const synthesized = synthesizeContent(rawContent, template);
    const formatted = formatForSession(synthesized, format);

    res.json({
      success: true,
      data: {
        path,
        synthesized,
        formatted
      }
    });
  } catch (error) {
    console.error('Error synthesizing chapter:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to synthesize chapter'
    });
  }
}

export async function searchContent(req: Request, res: Response) {
  try {
    const { q } = req.query;

    if (!q || typeof q !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      });
    }

    const results = await searchChapters(q);
    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Error searching content:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search content'
    });
  }
}
