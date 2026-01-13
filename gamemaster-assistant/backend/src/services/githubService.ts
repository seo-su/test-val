import { Chapter, ContentStructure, Act, GitHubContent } from '../types/index.js';

const GITHUB_API_BASE = 'https://api.github.com/repos/DragnaCarta/Curse-of-Strahd-Reloaded/contents';
const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/DragnaCarta/Curse-of-Strahd-Reloaded/main';

// Cache for content structure
let cachedStructure: ContentStructure | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function fetchContentStructure(): Promise<ContentStructure> {
  // Return cached structure if still valid
  if (cachedStructure && Date.now() - cacheTimestamp < CACHE_DURATION) {
    return cachedStructure;
  }

  const structure: ContentStructure = {
    acts: [],
    chapters: [],
    appendices: []
  };

  try {
    // Fetch root directory
    const response = await fetch(GITHUB_API_BASE);
    const contents: GitHubContent[] = await response.json();

    for (const item of contents) {
      if (item.type === 'dir') {
        if (item.name.startsWith('Act')) {
          const act = await parseAct(item.name, item.path);
          structure.acts.push(act);
        } else if (item.name === 'Chapter 1' || item.name === 'Chapter 2' || item.name === 'Chapter 3') {
          const chapters = await parseDirectory(item.path, item.name);
          structure.chapters.push(...chapters);
        } else if (item.name === 'Appendices') {
          const appendices = await parseDirectory(item.path, 'Appendices');
          structure.appendices.push(...appendices);
        }
      }
    }

    // Sort acts by number
    structure.acts.sort((a, b) => {
      const numA = parseInt(a.name.match(/\d+/)?.[0] || '0');
      const numB = parseInt(b.name.match(/\d+/)?.[0] || '0');
      return numA - numB;
    });

    cachedStructure = structure;
    cacheTimestamp = Date.now();

    return structure;
  } catch (error) {
    console.error('Error fetching content structure:', error);
    throw new Error('Failed to fetch content structure from GitHub');
  }
}

async function parseAct(actName: string, actPath: string): Promise<Act> {
  const act: Act = {
    id: actName.toLowerCase().replace(/\s+/g, '-'),
    name: actName,
    chapters: []
  };

  try {
    const response = await fetch(`${GITHUB_API_BASE}/${actPath}`);
    const contents: GitHubContent[] = await response.json();

    for (const item of contents) {
      if (item.type === 'dir' && item.name.startsWith('Arc')) {
        const arcChapters = await parseDirectory(item.path, item.name);
        act.chapters.push(...arcChapters);
      } else if (item.type === 'file' && item.name.endsWith('.md')) {
        act.chapters.push({
          id: item.name.replace('.md', '').toLowerCase().replace(/\s+/g, '-'),
          name: item.name.replace('.md', ''),
          path: item.path,
          act: actName
        });
      }
    }

    // Sort chapters by arc letter
    act.chapters.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error(`Error parsing act ${actName}:`, error);
  }

  return act;
}

async function parseDirectory(dirPath: string, parentName: string): Promise<Chapter[]> {
  const chapters: Chapter[] = [];

  try {
    const response = await fetch(`${GITHUB_API_BASE}/${dirPath}`);
    const contents: GitHubContent[] = await response.json();

    for (const item of contents) {
      if (item.type === 'file' && item.name.endsWith('.md')) {
        chapters.push({
          id: item.name.replace('.md', '').toLowerCase().replace(/\s+/g, '-'),
          name: item.name.replace('.md', ''),
          path: item.path,
          description: parentName
        });
      } else if (item.type === 'dir') {
        const subChapters = await parseDirectory(item.path, `${parentName} > ${item.name}`);
        chapters.push(...subChapters);
      }
    }
  } catch (error) {
    console.error(`Error parsing directory ${dirPath}:`, error);
  }

  return chapters;
}

export async function fetchChapterContent(chapterPath: string): Promise<string> {
  try {
    const url = `${GITHUB_RAW_BASE}/${chapterPath}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch chapter: ${response.statusText}`);
    }

    const content = await response.text();
    return content;
  } catch (error) {
    console.error('Error fetching chapter content:', error);
    throw new Error('Failed to fetch chapter content from GitHub');
  }
}

export async function searchChapters(query: string): Promise<Chapter[]> {
  const structure = await fetchContentStructure();
  const allChapters: Chapter[] = [
    ...structure.chapters,
    ...structure.appendices,
    ...structure.acts.flatMap(act => act.chapters)
  ];

  const lowerQuery = query.toLowerCase();
  return allChapters.filter(chapter =>
    chapter.name.toLowerCase().includes(lowerQuery) ||
    chapter.description?.toLowerCase().includes(lowerQuery) ||
    chapter.act?.toLowerCase().includes(lowerQuery)
  );
}
