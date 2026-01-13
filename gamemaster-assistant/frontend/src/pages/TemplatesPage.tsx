import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  Upload,
  Plus,
  Trash2,
  FileText,
  Loader2,
  Eye,
  Edit3,
  X,
  Check
} from 'lucide-react';
import {
  getTemplates,
  getTemplate,
  createTemplate,
  uploadTemplate,
  deleteTemplate
} from '../services/api';
import type { Template } from '../types';

function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [loadingTemplate, setLoadingTemplate] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  async function loadTemplates() {
    setLoading(true);
    const response = await getTemplates();
    if (response.success && response.data) {
      setTemplates(response.data);
    }
    setLoading(false);
  }

  async function handleSelectTemplate(id: string) {
    setLoadingTemplate(true);
    const response = await getTemplate(id);
    if (response.success && response.data) {
      setSelectedTemplate(response.data);
    }
    setLoadingTemplate(false);
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const response = await uploadTemplate(file);
    if (response.success) {
      loadTemplates();
    }
    setUploading(false);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this template?')) return;

    const response = await deleteTemplate(id);
    if (response.success) {
      if (selectedTemplate?.id === id) {
        setSelectedTemplate(null);
      }
      loadTemplates();
    }
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
          <h1 className="text-3xl font-medieval text-dm-gold">Templates</h1>
          <p className="text-gray-400 mt-1">
            Manage your note-taking templates for session preparation
          </p>
        </div>
        <div className="flex gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept=".md"
            onChange={handleUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="btn-secondary flex items-center gap-2"
          >
            {uploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            Upload .md
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Template
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Template List */}
        <div className="space-y-4">
          {templates.map((template) => (
            <div
              key={template.id}
              className={`card-hover p-4 ${
                selectedTemplate?.id === template.id ? 'border-dm-gold' : ''
              }`}
              onClick={() => handleSelectTemplate(template.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-dm-gold" />
                  <div>
                    <h3 className="font-medium text-white">{template.name}</h3>
                    <p className="text-xs text-gray-500">
                      {new Date(template.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {template.id !== 'default' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(template.id);
                    }}
                    className="text-gray-500 hover:text-dm-accent transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}

          {templates.length === 0 && (
            <div className="card p-8 text-center">
              <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No templates yet</p>
              <p className="text-sm text-gray-500 mt-1">
                Upload a .md file or create a new template
              </p>
            </div>
          )}
        </div>

        {/* Template Preview */}
        <div className="lg:col-span-2">
          <div className="card h-[calc(100vh-200px)] flex flex-col">
            {selectedTemplate ? (
              <>
                <div className="p-4 border-b border-dm-gold/20 flex items-center justify-between">
                  <h2 className="font-medieval text-xl text-dm-gold">
                    {selectedTemplate.name}
                  </h2>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Eye className="w-4 h-4" />
                    Preview
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-6">
                  {loadingTemplate ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="w-6 h-6 text-dm-gold animate-spin" />
                    </div>
                  ) : (
                    <div className="markdown-content">
                      <ReactMarkdown>{selectedTemplate.content || ''}</ReactMarkdown>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <FileText className="w-12 h-12 mb-4" />
                <p>Select a template to preview</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <CreateTemplateModal
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            setShowCreateModal(false);
            loadTemplates();
          }}
        />
      )}
    </div>
  );
}

interface CreateTemplateModalProps {
  onClose: () => void;
  onCreated: () => void;
}

function CreateTemplateModal({ onClose, onCreated }: CreateTemplateModalProps) {
  const [name, setName] = useState('');
  const [content, setContent] = useState(`# {{title}}

## Session Overview
{{summary}}

## Key Points
-

## NPCs Present
| Name | Role | Notes |
|------|------|-------|
| | | |

## Locations
-

## Encounters
-

## Treasure
-

## Session Notes
-

## DM Reminders
- [ ]
`);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!name.trim() || !content.trim()) return;

    setSaving(true);
    const response = await createTemplate(name, content);
    if (response.success) {
      onCreated();
    }
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="card w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="p-4 border-b border-dm-gold/20 flex items-center justify-between">
          <h2 className="font-medieval text-xl text-dm-gold">Create New Template</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Template Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Session Template"
              className="input w-full"
            />
          </div>

          <div className="flex-1">
            <label className="block text-sm text-gray-400 mb-2">
              Template Content (Markdown)
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="input w-full h-96 font-mono text-sm resize-none"
              placeholder="Enter your template in Markdown format..."
            />
          </div>

          <div className="text-sm text-gray-500">
            <p className="mb-1">Available placeholders:</p>
            <ul className="list-disc list-inside space-y-0.5">
              <li><code className="bg-dm-dark px-1 rounded">{'{{title}}'}</code> - Chapter title</li>
              <li><code className="bg-dm-dark px-1 rounded">{'{{summary}}'}</code> - Chapter summary</li>
            </ul>
          </div>
        </div>

        <div className="p-4 border-t border-dm-gold/20 flex justify-end gap-3">
          <button onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim() || !content.trim() || saving}
            className="btn-primary flex items-center gap-2"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            Create Template
          </button>
        </div>
      </div>
    </div>
  );
}

export default TemplatesPage;
