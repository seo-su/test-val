import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Template } from '../types/index.js';

// In-memory storage for templates (in production, use a database)
const templates: Map<string, Template> = new Map();

// Initialize with a default template
const defaultTemplate: Template = {
  id: 'default',
  name: 'Default Session Notes Template',
  content: `# {{title}}

## Session Overview
{{summary}}

## Key Points to Remember
- Important plot points
- Player decisions that matter
- Upcoming hooks

## NPCs Present
| Name | Role | Notes |
|------|------|-------|
| | | |

## Locations
### Location Name
- Description
- Key features
- Secrets

## Encounters
### Encounter Name
- Difficulty:
- Creatures:
- Tactics:

## Treasure & Rewards
-

## Session Notes
### Before Session
-

### During Session
-

### After Session (Follow-up)
-

## DM Reminders
- [ ]
`,
  createdAt: new Date()
};

templates.set(defaultTemplate.id, defaultTemplate);

export async function getTemplates(req: Request, res: Response) {
  try {
    const templateList = Array.from(templates.values()).map(t => ({
      id: t.id,
      name: t.name,
      createdAt: t.createdAt
    }));

    res.json({
      success: true,
      data: templateList
    });
  } catch (error) {
    console.error('Error getting templates:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get templates'
    });
  }
}

export async function getTemplate(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const template = templates.get(id);

    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Template not found'
      });
    }

    res.json({
      success: true,
      data: template
    });
  } catch (error) {
    console.error('Error getting template:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get template'
    });
  }
}

export async function uploadTemplate(req: Request, res: Response) {
  try {
    const file = req.file;
    const { name } = req.body;

    if (!file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    const content = file.buffer.toString('utf-8');
    const template: Template = {
      id: uuidv4(),
      name: name || file.originalname.replace('.md', ''),
      content,
      createdAt: new Date()
    };

    templates.set(template.id, template);

    res.json({
      success: true,
      data: template
    });
  } catch (error) {
    console.error('Error uploading template:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload template'
    });
  }
}

export async function createTemplate(req: Request, res: Response) {
  try {
    const { name, content } = req.body;

    if (!name || !content) {
      return res.status(400).json({
        success: false,
        error: 'Name and content are required'
      });
    }

    const template: Template = {
      id: uuidv4(),
      name,
      content,
      createdAt: new Date()
    };

    templates.set(template.id, template);

    res.json({
      success: true,
      data: template
    });
  } catch (error) {
    console.error('Error creating template:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create template'
    });
  }
}

export async function deleteTemplate(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (id === 'default') {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete default template'
      });
    }

    if (!templates.has(id)) {
      return res.status(404).json({
        success: false,
        error: 'Template not found'
      });
    }

    templates.delete(id);

    res.json({
      success: true,
      message: 'Template deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting template:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete template'
    });
  }
}
