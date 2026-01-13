import { SynthesizedContent, NPC, Location, Encounter } from '../types/index.js';

interface TemplateStructure {
  sections: string[];
  format: 'detailed' | 'compact' | 'custom';
  customTemplate?: string;
}

const DEFAULT_TEMPLATE: TemplateStructure = {
  sections: ['summary', 'keyPoints', 'npcs', 'locations', 'encounters', 'treasures', 'notes'],
  format: 'detailed'
};

export function synthesizeContent(
  rawContent: string,
  template?: string
): SynthesizedContent {
  const templateStructure = template
    ? parseTemplate(template)
    : DEFAULT_TEMPLATE;

  const title = extractTitle(rawContent);
  const summary = extractSummary(rawContent);
  const keyPoints = extractKeyPoints(rawContent);
  const npcs = extractNPCs(rawContent);
  const locations = extractLocations(rawContent);
  const encounters = extractEncounters(rawContent);
  const treasures = extractTreasures(rawContent);
  const notes = generateNotes(rawContent, templateStructure);

  return {
    title,
    summary,
    keyPoints,
    npcs,
    locations,
    encounters,
    treasures,
    notes,
    rawContent
  };
}

function parseTemplate(templateContent: string): TemplateStructure {
  const sections: string[] = [];

  // Parse markdown template to identify sections
  const headingRegex = /^#{1,3}\s+(.+)$/gm;
  let match;

  while ((match = headingRegex.exec(templateContent)) !== null) {
    const heading = match[1].toLowerCase();
    if (heading.includes('summary') || heading.includes('résumé')) {
      sections.push('summary');
    } else if (heading.includes('key') || heading.includes('points') || heading.includes('important')) {
      sections.push('keyPoints');
    } else if (heading.includes('npc') || heading.includes('character') || heading.includes('personnage')) {
      sections.push('npcs');
    } else if (heading.includes('location') || heading.includes('lieu') || heading.includes('place')) {
      sections.push('locations');
    } else if (heading.includes('encounter') || heading.includes('combat') || heading.includes('rencontre')) {
      sections.push('encounters');
    } else if (heading.includes('treasure') || heading.includes('loot') || heading.includes('trésor')) {
      sections.push('treasures');
    } else if (heading.includes('note')) {
      sections.push('notes');
    }
  }

  return {
    sections: sections.length > 0 ? sections : DEFAULT_TEMPLATE.sections,
    format: 'custom',
    customTemplate: templateContent
  };
}

function extractTitle(content: string): string {
  const titleMatch = content.match(/^#\s+(.+)$/m);
  return titleMatch ? titleMatch[1].trim() : 'Untitled Chapter';
}

function extractSummary(content: string): string {
  // Look for design notes or summary sections
  const designNotesMatch = content.match(/>\s*\[!abstract\]\+?\s*Design Notes[^>]*\n([\s\S]*?)(?=\n(?:>|#|$))/i);
  if (designNotesMatch) {
    return cleanText(designNotesMatch[1]);
  }

  // Extract first meaningful paragraph
  const paragraphs = content.split('\n\n').filter(p =>
    p.trim() &&
    !p.startsWith('#') &&
    !p.startsWith('>') &&
    !p.startsWith('!')
  );

  if (paragraphs.length > 0) {
    return cleanText(paragraphs[0]).substring(0, 500) + (paragraphs[0].length > 500 ? '...' : '');
  }

  return 'No summary available.';
}

function extractKeyPoints(content: string): string[] {
  const keyPoints: string[] = [];

  // Look for key information sections
  const infoBoxRegex = />\s*\[!info\]\+?\s*([^\n]+)\n([\s\S]*?)(?=\n(?:>(?!\s)|#|$))/gi;
  let match;

  while ((match = infoBoxRegex.exec(content)) !== null) {
    keyPoints.push(`**${match[1].trim()}**: ${cleanText(match[2]).substring(0, 200)}`);
  }

  // Look for warning/important sections
  const warningRegex = />\s*\[!warning\]\+?\s*([^\n]+)\n([\s\S]*?)(?=\n(?:>(?!\s)|#|$))/gi;
  while ((match = warningRegex.exec(content)) !== null) {
    keyPoints.push(`⚠️ **${match[1].trim()}**: ${cleanText(match[2]).substring(0, 200)}`);
  }

  // Extract bullet points from main sections
  const bulletPoints = content.match(/^\s*[-*]\s+(.+)$/gm);
  if (bulletPoints && keyPoints.length < 5) {
    for (const point of bulletPoints.slice(0, 5 - keyPoints.length)) {
      const cleanPoint = cleanText(point.replace(/^[-*]\s+/, ''));
      if (cleanPoint.length > 20 && cleanPoint.length < 300) {
        keyPoints.push(cleanPoint);
      }
    }
  }

  return keyPoints.slice(0, 10);
}

function extractNPCs(content: string): NPC[] {
  const npcs: NPC[] = [];

  // Look for NPC headers (### Name pattern often used for NPCs)
  const npcSectionRegex = /###\s+([A-Z][a-zA-Z\s]+)\n([\s\S]*?)(?=\n###|\n##|\n#|$)/g;
  let match;

  while ((match = npcSectionRegex.exec(content)) !== null) {
    const name = match[1].trim();
    const sectionContent = match[2];

    // Skip non-NPC sections
    if (name.match(/^(The|A|An|Location|Area|Room|Combat|Encounter|Treasure)/i)) {
      continue;
    }

    // Look for roleplay notes
    const roleplayMatch = sectionContent.match(/>\s*\[!(?:tip|info)\][^\n]*Roleplay[^\n]*\n([\s\S]*?)(?=\n(?:>(?!\s)|#|$))/i);
    const roleplayTips = roleplayMatch ? cleanText(roleplayMatch[1]) : undefined;

    // Extract description (first paragraph)
    const descMatch = sectionContent.match(/^([^>#\n][^\n]+)/m);
    const description = descMatch ? cleanText(descMatch[1]) : 'No description available.';

    if (name && description) {
      npcs.push({
        name,
        description: description.substring(0, 300),
        roleplayTips: roleplayTips?.substring(0, 300)
      });
    }
  }

  return npcs.slice(0, 15);
}

function extractLocations(content: string): Location[] {
  const locations: Location[] = [];

  // Look for location headers (often marked with area letters like A1, B2, etc.)
  const locationRegex = /##\s+([A-Z]\d+[a-z]?\.\s+[^\n]+|The\s+[^\n]+|[A-Z][a-z]+\s+(?:Room|Hall|Chamber|Tower|Cellar|Dungeon)[^\n]*)\n([\s\S]*?)(?=\n##|$)/g;
  let match;

  while ((match = locationRegex.exec(content)) !== null) {
    const name = match[1].trim();
    const sectionContent = match[2];

    // Extract description
    const descParagraphs = sectionContent.split('\n\n').filter(p =>
      p.trim() && !p.startsWith('#') && !p.startsWith('>')
    );

    const description = descParagraphs.length > 0
      ? cleanText(descParagraphs[0]).substring(0, 400)
      : 'No description available.';

    // Extract features (bullet points)
    const features: string[] = [];
    const bulletPoints = sectionContent.match(/^\s*[-*]\s+(.+)$/gm);
    if (bulletPoints) {
      for (const point of bulletPoints.slice(0, 5)) {
        features.push(cleanText(point.replace(/^[-*]\s+/, '')));
      }
    }

    locations.push({
      name,
      description,
      features: features.length > 0 ? features : undefined
    });
  }

  return locations.slice(0, 15);
}

function extractEncounters(content: string): Encounter[] {
  const encounters: Encounter[] = [];

  // Look for combat/encounter sections
  const encounterRegex = />\s*\[!combat\]\+?\s*([^\n]+)\n([\s\S]*?)(?=\n(?:>(?!\s)|#|$))/gi;
  let match;

  while ((match = encounterRegex.exec(content)) !== null) {
    const name = match[1].trim();
    const sectionContent = match[2];

    encounters.push({
      name,
      description: cleanText(sectionContent).substring(0, 400),
      tactics: extractTactics(sectionContent)
    });
  }

  // Also look for encounter headers
  const encounterHeaderRegex = /###?\s+(Combat|Encounter|Battle|Fight):\s*([^\n]+)\n([\s\S]*?)(?=\n###?|$)/gi;
  while ((match = encounterHeaderRegex.exec(content)) !== null) {
    const name = match[2].trim();
    const sectionContent = match[3];

    encounters.push({
      name,
      description: cleanText(sectionContent).substring(0, 400),
      tactics: extractTactics(sectionContent)
    });
  }

  return encounters.slice(0, 10);
}

function extractTactics(content: string): string | undefined {
  const tacticsMatch = content.match(/(?:tactics?|strategy|stratégie)[:\s]+([^\n]+(?:\n(?![#>])[^\n]+)*)/i);
  return tacticsMatch ? cleanText(tacticsMatch[1]).substring(0, 300) : undefined;
}

function extractTreasures(content: string): string[] {
  const treasures: string[] = [];

  // Look for treasure/loot mentions
  const treasureRegex = /(?:treasure|loot|reward|récompense|trésor)[:\s]+([^\n]+)/gi;
  let match;

  while ((match = treasureRegex.exec(content)) !== null) {
    treasures.push(cleanText(match[1]));
  }

  // Look for item callouts
  const itemRegex = />\s*\[!item\]\+?\s*([^\n]+)/gi;
  while ((match = itemRegex.exec(content)) !== null) {
    treasures.push(cleanText(match[1]));
  }

  return treasures.slice(0, 10);
}

function generateNotes(content: string, template: TemplateStructure): string {
  if (template.customTemplate) {
    return applyCustomTemplate(content, template.customTemplate);
  }

  // Generate structured notes based on format
  const notes: string[] = [];

  // Add quick reference section
  notes.push('## Quick Reference\n');
  notes.push('Use this section during your session for quick lookups.\n');

  // Add DM tips if found
  const dmTips = content.match(/>\s*\[!(?:tip|warning)\][^\n]*(?:DM|GM|MJ)[^\n]*\n([\s\S]*?)(?=\n(?:>(?!\s)|#|$))/gi);
  if (dmTips && dmTips.length > 0) {
    notes.push('### DM Tips\n');
    for (const tip of dmTips.slice(0, 5)) {
      notes.push(`- ${cleanText(tip).substring(0, 200)}\n`);
    }
  }

  return notes.join('\n');
}

function applyCustomTemplate(content: string, template: string): string {
  // Parse placeholders in template and fill with content
  let result = template;

  // Replace common placeholders
  result = result.replace(/\{\{title\}\}/g, extractTitle(content));
  result = result.replace(/\{\{summary\}\}/g, extractSummary(content));

  return result;
}

function cleanText(text: string): string {
  return text
    .replace(/>\s*/g, '')
    .replace(/\[\[([^\]|]+)\|?([^\]]*)\]\]/g, (_, link, display) => display || link)
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_]{1,2}([^*_]+)[*_]{1,2}/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function formatForSession(synthesized: SynthesizedContent, format: 'markdown' | 'html' | 'plain' = 'markdown'): string {
  const sections: string[] = [];

  // Title
  sections.push(`# ${synthesized.title}\n`);

  // Summary
  sections.push(`## Summary\n${synthesized.summary}\n`);

  // Key Points
  if (synthesized.keyPoints.length > 0) {
    sections.push('## Key Points');
    for (const point of synthesized.keyPoints) {
      sections.push(`- ${point}`);
    }
    sections.push('');
  }

  // NPCs
  if (synthesized.npcs.length > 0) {
    sections.push('## NPCs');
    for (const npc of synthesized.npcs) {
      sections.push(`### ${npc.name}`);
      sections.push(npc.description);
      if (npc.roleplayTips) {
        sections.push(`**Roleplay Tips:** ${npc.roleplayTips}`);
      }
      sections.push('');
    }
  }

  // Locations
  if (synthesized.locations.length > 0) {
    sections.push('## Locations');
    for (const location of synthesized.locations) {
      sections.push(`### ${location.name}`);
      sections.push(location.description);
      if (location.features && location.features.length > 0) {
        sections.push('**Features:**');
        for (const feature of location.features) {
          sections.push(`- ${feature}`);
        }
      }
      sections.push('');
    }
  }

  // Encounters
  if (synthesized.encounters.length > 0) {
    sections.push('## Encounters');
    for (const encounter of synthesized.encounters) {
      sections.push(`### ${encounter.name}`);
      sections.push(encounter.description);
      if (encounter.tactics) {
        sections.push(`**Tactics:** ${encounter.tactics}`);
      }
      sections.push('');
    }
  }

  // Treasures
  if (synthesized.treasures.length > 0) {
    sections.push('## Treasures & Rewards');
    for (const treasure of synthesized.treasures) {
      sections.push(`- ${treasure}`);
    }
    sections.push('');
  }

  // Notes
  if (synthesized.notes) {
    sections.push(synthesized.notes);
  }

  const markdown = sections.join('\n');

  if (format === 'plain') {
    return markdown.replace(/[#*_`]/g, '');
  }

  return markdown;
}
