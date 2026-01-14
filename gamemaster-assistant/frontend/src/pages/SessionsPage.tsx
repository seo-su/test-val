import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  ScrollText,
  Trash2,
  Edit3,
  Download,
  Loader2,
  Calendar,
  BookOpen
} from 'lucide-react';
import {
  getSessionNotes,
  deleteSessionNote,
  createSessionNote,
  getExportUrl
} from '../services/api';
import type { SessionNote } from '../types';

function SessionsPage() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<SessionNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadSessions();
  }, []);

  async function loadSessions() {
    setLoading(true);
    const response = await getSessionNotes();
    if (response.success && response.data) {
      setSessions(response.data);
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this session note?')) return;

    const response = await deleteSessionNote(id);
    if (response.success) {
      loadSessions();
    }
  }

  function handleExport(id: string) {
    window.open(getExportUrl(id, 'markdown'), '_blank');
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-dm-gold animate-spin" />
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-medieval text-dm-gold">Session Notes</h1>
          <p className="text-gray-400 mt-1">
            Your prepared session notes ready for game night
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Session
        </button>
      </div>

      {sessions.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="card-hover p-6 group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-dm-blue rounded-lg">
                    <ScrollText className="w-5 h-5 text-dm-gold" />
                  </div>
                  <div>
                    <h3 className="font-medieval text-lg text-white group-hover:text-dm-gold transition-colors">
                      {session.title}
                    </h3>
                    <p className="text-sm text-gray-500">{session.chapter}</p>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-400 line-clamp-3 mb-4">
                {session.content.substring(0, 150)}...
              </p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Calendar className="w-3 h-3" />
                  {new Date(session.updatedAt).toLocaleDateString()}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleExport(session.id)}
                    className="p-2 text-gray-400 hover:text-dm-gold transition-colors"
                    title="Export"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => navigate(`/sessions/${session.id}`)}
                    className="p-2 text-gray-400 hover:text-dm-gold transition-colors"
                    title="Edit"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(session.id)}
                    className="p-2 text-gray-400 hover:text-dm-accent transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <ScrollText className="w-16 h-16 text-dm-gold/30 mx-auto mb-4" />
          <h3 className="font-medieval text-xl text-gray-400 mb-2">
            No Session Notes Yet
          </h3>
          <p className="text-gray-500 mb-6">
            Create your first session notes by synthesizing a chapter or starting from scratch
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => navigate('/synthesize')}
              className="btn-secondary flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              Synthesize Chapter
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Blank
            </button>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <CreateSessionModal
          onClose={() => setShowCreateModal(false)}
          onCreated={(id) => {
            setShowCreateModal(false);
            navigate(`/sessions/${id}`);
          }}
        />
      )}
    </div>
  );
}

interface CreateSessionModalProps {
  onClose: () => void;
  onCreated: (id: string) => void;
}

function CreateSessionModal({ onClose, onCreated }: CreateSessionModalProps) {
  const [title, setTitle] = useState('');
  const [chapter, setChapter] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleCreate() {
    if (!title.trim()) return;

    setSaving(true);
    const content = `# ${title}

## Session Overview
Add your session overview here...

## Key Points
-

## NPCs
-

## Locations
-

## Notes
-
`;
    const response = await createSessionNote(title, chapter || 'General', content);
    if (response.success && response.data) {
      onCreated(response.data.id);
    }
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="card w-full max-w-md">
        <div className="p-4 border-b border-dm-gold/20">
          <h2 className="font-medieval text-xl text-dm-gold">Create New Session</h2>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Session Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Session 1: Death House"
              className="input w-full"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Chapter/Arc (optional)</label>
            <input
              type="text"
              value={chapter}
              onChange={(e) => setChapter(e.target.value)}
              placeholder="Act I - Into the Mists"
              className="input w-full"
            />
          </div>
        </div>

        <div className="p-4 border-t border-dm-gold/20 flex justify-end gap-3">
          <button onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!title.trim() || saving}
            className="btn-primary flex items-center gap-2"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            Create
          </button>
        </div>
      </div>
    </div>
  );
}

export default SessionsPage;
