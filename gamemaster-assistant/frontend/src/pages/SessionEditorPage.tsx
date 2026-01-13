import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import {
  Save,
  Eye,
  Edit3,
  Download,
  ArrowLeft,
  Loader2,
  Check
} from 'lucide-react';
import {
  getSessionNote,
  updateSessionNote,
  getExportUrl
} from '../services/api';
import type { SessionNote } from '../types';

function SessionEditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [session, setSession] = useState<SessionNote | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');

  const [title, setTitle] = useState('');
  const [chapter, setChapter] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    if (id) {
      loadSession(id);
    }
  }, [id]);

  async function loadSession(sessionId: string) {
    setLoading(true);
    const response = await getSessionNote(sessionId);
    if (response.success && response.data) {
      setSession(response.data);
      setTitle(response.data.title);
      setChapter(response.data.chapter);
      setContent(response.data.content);
    }
    setLoading(false);
  }

  async function handleSave() {
    if (!id) return;

    setSaving(true);
    const response = await updateSessionNote(id, { title, chapter, content });
    if (response.success && response.data) {
      setSession(response.data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
    setSaving(false);
  }

  function handleExport() {
    if (id) {
      window.open(getExportUrl(id, 'markdown'), '_blank');
    }
  }

  // Auto-save on blur
  function handleBlur() {
    if (
      title !== session?.title ||
      chapter !== session?.chapter ||
      content !== session?.content
    ) {
      handleSave();
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-dm-gold animate-spin" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="card p-12 text-center">
        <p className="text-dm-accent">Session not found</p>
        <button onClick={() => navigate('/sessions')} className="btn-primary mt-4">
          Back to Sessions
        </button>
      </div>
    );
  }

  return (
    <div className="fade-in h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/sessions')}
            className="btn-ghost flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleBlur}
              className="bg-transparent text-2xl font-medieval text-dm-gold focus:outline-none border-b border-transparent focus:border-dm-gold/50"
            />
            <div className="flex items-center gap-2 mt-1">
              <input
                type="text"
                value={chapter}
                onChange={(e) => setChapter(e.target.value)}
                onBlur={handleBlur}
                placeholder="Chapter/Arc"
                className="bg-transparent text-sm text-gray-400 focus:outline-none"
              />
              {saved && (
                <span className="text-green-500 text-xs flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  Saved
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Mode Toggle */}
          <div className="flex bg-dm-dark/50 rounded-lg p-1">
            <button
              onClick={() => setMode('edit')}
              className={`px-3 py-1.5 rounded text-sm flex items-center gap-2 transition-colors ${
                mode === 'edit'
                  ? 'bg-dm-blue text-dm-gold'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Edit3 className="w-4 h-4" />
              Edit
            </button>
            <button
              onClick={() => setMode('preview')}
              className={`px-3 py-1.5 rounded text-sm flex items-center gap-2 transition-colors ${
                mode === 'preview'
                  ? 'bg-dm-blue text-dm-gold'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Eye className="w-4 h-4" />
              Preview
            </button>
          </div>

          <button
            onClick={handleExport}
            className="btn-secondary flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary flex items-center gap-2"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save
          </button>
        </div>
      </div>

      {/* Editor/Preview */}
      <div className="card flex-1 flex flex-col overflow-hidden">
        {mode === 'edit' ? (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onBlur={handleBlur}
            className="flex-1 bg-transparent p-6 text-gray-200 font-mono text-sm resize-none focus:outline-none"
            placeholder="Write your session notes in Markdown..."
          />
        ) : (
          <div className="flex-1 overflow-y-auto p-6">
            <div className="markdown-content max-w-4xl mx-auto">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>

      {/* Footer with help */}
      <div className="mt-4 text-center text-xs text-gray-500">
        <p>
          Use Markdown for formatting. Changes are auto-saved when you leave a field.
        </p>
      </div>
    </div>
  );
}

export default SessionEditorPage;
