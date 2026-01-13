import type {
  ContentStructure,
  Chapter,
  Template,
  SessionNote,
  SynthesizedContent,
  ApiResponse
} from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

// Chapters API
export async function getContentStructure(): Promise<ApiResponse<ContentStructure>> {
  return fetchApi<ContentStructure>('/chapters');
}

export async function getChapterContent(path: string): Promise<ApiResponse<{ path: string; content: string }>> {
  return fetchApi<{ path: string; content: string }>(
    `/chapters/content?path=${encodeURIComponent(path)}`
  );
}

export async function synthesizeChapter(
  path: string,
  template?: string
): Promise<ApiResponse<{ path: string; synthesized: SynthesizedContent; formatted: string }>> {
  return fetchApi<{ path: string; synthesized: SynthesizedContent; formatted: string }>(
    '/chapters/synthesize',
    {
      method: 'POST',
      body: JSON.stringify({ path, template }),
    }
  );
}

export async function searchChapters(query: string): Promise<ApiResponse<Chapter[]>> {
  return fetchApi<Chapter[]>(`/chapters/search?q=${encodeURIComponent(query)}`);
}

// Templates API
export async function getTemplates(): Promise<ApiResponse<Template[]>> {
  return fetchApi<Template[]>('/templates');
}

export async function getTemplate(id: string): Promise<ApiResponse<Template>> {
  return fetchApi<Template>(`/templates/${id}`);
}

export async function createTemplate(
  name: string,
  content: string
): Promise<ApiResponse<Template>> {
  return fetchApi<Template>('/templates', {
    method: 'POST',
    body: JSON.stringify({ name, content }),
  });
}

export async function uploadTemplate(file: File, name?: string): Promise<ApiResponse<Template>> {
  const formData = new FormData();
  formData.append('template', file);
  if (name) {
    formData.append('name', name);
  }

  try {
    const response = await fetch(`${API_BASE}/templates/upload`, {
      method: 'POST',
      body: formData,
    });
    return response.json();
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}

export async function deleteTemplate(id: string): Promise<ApiResponse<void>> {
  return fetchApi<void>(`/templates/${id}`, {
    method: 'DELETE',
  });
}

// Session Notes API
export async function getSessionNotes(): Promise<ApiResponse<SessionNote[]>> {
  return fetchApi<SessionNote[]>('/sessions');
}

export async function getSessionNote(id: string): Promise<ApiResponse<SessionNote>> {
  return fetchApi<SessionNote>(`/sessions/${id}`);
}

export async function createSessionNote(
  title: string,
  chapter: string,
  content: string
): Promise<ApiResponse<SessionNote>> {
  return fetchApi<SessionNote>('/sessions', {
    method: 'POST',
    body: JSON.stringify({ title, chapter, content }),
  });
}

export async function updateSessionNote(
  id: string,
  updates: Partial<Pick<SessionNote, 'title' | 'chapter' | 'content'>>
): Promise<ApiResponse<SessionNote>> {
  return fetchApi<SessionNote>(`/sessions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

export async function deleteSessionNote(id: string): Promise<ApiResponse<void>> {
  return fetchApi<void>(`/sessions/${id}`, {
    method: 'DELETE',
  });
}

export function getExportUrl(id: string, format: 'markdown' | 'json' = 'markdown'): string {
  return `${API_BASE}/sessions/${id}/export?format=${format}`;
}
