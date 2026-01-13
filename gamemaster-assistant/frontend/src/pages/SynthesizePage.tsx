import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import {
  Sparkles,
  Loader2,
  ChevronDown,
  Save,
  Download,
  Copy,
  Check,
  Users,
  MapPin,
  Swords,
  Gem,
  BookOpen
} from 'lucide-react';
import {
  getContentStructure,
  synthesizeChapter,
  getTemplates,
  createSessionNote
} from '../services/api';
import type { ContentStructure, Chapter, Template, SynthesizedContent } from '../types';

function SynthesizePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const preselectedChapter = location.state?.chapter as Chapter | undefined;

  const [structure, setStructure] = useState<ContentStructure | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(preselectedChapter || null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('default');
  const [loading, setLoading] = useState(false);
  const [loadingStructure, setLoadingStructure] = useState(true);
  const [synthesized, setSynthesized] = useState<SynthesizedContent | null>(null);
  const [formatted, setFormatted] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'structured' | 'markdown'>('structured');
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoadingStructure(true);
    const [structureRes, templatesRes] = await Promise.all([
      getContentStructure(),
      getTemplates()
    ]);

    if (structureRes.success && structureRes.data) {
      setStructure(structureRes.data);
    }
    if (templatesRes.success && templatesRes.data) {
      setTemplates(templatesRes.data);
    }
    setLoadingStructure(false);
  }

  async function handleSynthesize() {
    if (!selectedChapter) return;

    setLoading(true);
    setSynthesized(null);
    setFormatted('');

    const response = await synthesizeChapter(
      selectedChapter.path,
      selectedTemplate !== 'default' ? selectedTemplate : undefined
    );

    if (response.success && response.data) {
      setSynthesized(response.data.synthesized);
      setFormatted(response.data.formatted);
    }

    setLoading(false);
  }

  async function handleSaveAsSession() {
    if (!synthesized || !formatted) return;

    setSaving(true);
    const response = await createSessionNote(
      synthesized.title,
      selectedChapter?.name || 'Unknown',
      formatted
    );

    if (response.success && response.data) {
      navigate(`/sessions/${response.data.id}`);
    }
    setSaving(false);
  }

  function handleCopy() {
    navigator.clipboard.writeText(formatted);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownload() {
    const blob = new Blob([formatted], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${synthesized?.title || 'session-notes'}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function getAllChapters(): Chapter[] {
    if (!structure) return [];
    return [
      ...structure.chapters,
      ...structure.acts.flatMap(act => act.chapters),
      ...structure.appendices
    ];
  }

  if (loadingStructure) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-dm-gold animate-spin" />
      </div>
    );
  }

  return (
    <div className="fade-in max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-medieval text-dm-gold">Synthesize Content</h1>
        <p className="text-gray-400 mt-1">
          Transform chapter content into organized, session-ready notes
        </p>
      </div>

      {/* Controls */}
      <div className="card p-6 mb-6">
        <div className="grid md:grid-cols-3 gap-4">
          {/* Chapter Selection */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Select Chapter
            </label>
            <div className="relative">
              <select
                value={selectedChapter?.path || ''}
                onChange={(e) => {
                  const chapter = getAllChapters().find(c => c.path === e.target.value);
                  setSelectedChapter(chapter || null);
                }}
                className="input w-full appearance-none pr-10"
              >
                <option value="">Choose a chapter...</option>
                {structure?.chapters && structure.chapters.length > 0 && (
                  <optgroup label="Foundation">
                    {structure.chapters.map(ch => (
                      <option key={ch.path} value={ch.path}>{ch.name}</option>
                    ))}
                  </optgroup>
                )}
                {structure?.acts.map(act => (
                  <optgroup key={act.id} label={act.name}>
                    {act.chapters.map(ch => (
                      <option key={ch.path} value={ch.path}>{ch.name}</option>
                    ))}
                  </optgroup>
                ))}
                {structure?.appendices && structure.appendices.length > 0 && (
                  <optgroup label="Appendices">
                    {structure.appendices.map(ch => (
                      <option key={ch.path} value={ch.path}>{ch.name}</option>
                    ))}
                  </optgroup>
                )}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
          </div>

          {/* Template Selection */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Note Template
            </label>
            <div className="relative">
              <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                className="input w-full appearance-none pr-10"
              >
                {templates.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
          </div>

          {/* Synthesize Button */}
          <div className="flex items-end">
            <button
              onClick={handleSynthesize}
              disabled={!selectedChapter || loading}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Sparkles className="w-5 h-5" />
              )}
              {loading ? 'Synthesizing...' : 'Synthesize'}
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      {synthesized && (
        <div className="card">
          {/* Tabs & Actions */}
          <div className="flex items-center justify-between p-4 border-b border-dm-gold/20">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('structured')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'structured'
                    ? 'bg-dm-blue text-dm-gold'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Structured View
              </button>
              <button
                onClick={() => setActiveTab('markdown')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'markdown'
                    ? 'bg-dm-blue text-dm-gold'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Markdown
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="btn-secondary flex items-center gap-2"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <button
                onClick={handleDownload}
                className="btn-secondary flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
              <button
                onClick={handleSaveAsSession}
                disabled={saving}
                className="btn-primary flex items-center gap-2"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save as Session
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            {activeTab === 'structured' ? (
              <StructuredView content={synthesized} />
            ) : (
              <div className="markdown-content">
                <ReactMarkdown>{formatted}</ReactMarkdown>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!synthesized && !loading && (
        <div className="card p-12 text-center">
          <BookOpen className="w-16 h-16 text-dm-gold/30 mx-auto mb-4" />
          <h3 className="font-medieval text-xl text-gray-400 mb-2">
            Ready to Synthesize
          </h3>
          <p className="text-gray-500">
            Select a chapter and click Synthesize to generate session-ready notes
          </p>
        </div>
      )}
    </div>
  );
}

interface StructuredViewProps {
  content: SynthesizedContent;
}

function StructuredView({ content }: StructuredViewProps) {
  return (
    <div className="space-y-8">
      {/* Title & Summary */}
      <div>
        <h2 className="font-medieval text-2xl text-dm-gold mb-4">{content.title}</h2>
        <p className="text-gray-300 leading-relaxed">{content.summary}</p>
      </div>

      {/* Key Points */}
      {content.keyPoints.length > 0 && (
        <div>
          <h3 className="font-medieval text-lg text-dm-accent mb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Key Points
          </h3>
          <ul className="space-y-2">
            {content.keyPoints.map((point, i) => (
              <li key={i} className="flex items-start gap-2 text-gray-300">
                <span className="text-dm-gold mt-1">*</span>
                {point}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* NPCs */}
      {content.npcs.length > 0 && (
        <div>
          <h3 className="font-medieval text-lg text-dm-accent mb-3 flex items-center gap-2">
            <Users className="w-5 h-5" />
            NPCs ({content.npcs.length})
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {content.npcs.map((npc, i) => (
              <div key={i} className="bg-dm-dark/50 rounded-lg p-4">
                <h4 className="font-medieval text-dm-gold mb-2">{npc.name}</h4>
                <p className="text-sm text-gray-400">{npc.description}</p>
                {npc.roleplayTips && (
                  <p className="text-sm text-gray-500 mt-2 italic">
                    Roleplay: {npc.roleplayTips}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Locations */}
      {content.locations.length > 0 && (
        <div>
          <h3 className="font-medieval text-lg text-dm-accent mb-3 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Locations ({content.locations.length})
          </h3>
          <div className="space-y-4">
            {content.locations.map((loc, i) => (
              <div key={i} className="bg-dm-dark/50 rounded-lg p-4">
                <h4 className="font-medieval text-dm-gold mb-2">{loc.name}</h4>
                <p className="text-sm text-gray-400">{loc.description}</p>
                {loc.features && loc.features.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {loc.features.map((f, j) => (
                      <li key={j} className="text-xs text-gray-500 flex items-center gap-2">
                        <span className="w-1 h-1 bg-dm-gold rounded-full" />
                        {f}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Encounters */}
      {content.encounters.length > 0 && (
        <div>
          <h3 className="font-medieval text-lg text-dm-accent mb-3 flex items-center gap-2">
            <Swords className="w-5 h-5" />
            Encounters ({content.encounters.length})
          </h3>
          <div className="space-y-4">
            {content.encounters.map((enc, i) => (
              <div key={i} className="bg-dm-dark/50 rounded-lg p-4 border-l-4 border-dm-accent">
                <h4 className="font-medieval text-dm-gold mb-2">{enc.name}</h4>
                <p className="text-sm text-gray-400">{enc.description}</p>
                {enc.tactics && (
                  <p className="text-sm text-gray-500 mt-2">
                    <span className="text-dm-accent">Tactics:</span> {enc.tactics}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Treasures */}
      {content.treasures.length > 0 && (
        <div>
          <h3 className="font-medieval text-lg text-dm-accent mb-3 flex items-center gap-2">
            <Gem className="w-5 h-5" />
            Treasures & Rewards
          </h3>
          <ul className="space-y-2">
            {content.treasures.map((treasure, i) => (
              <li key={i} className="flex items-center gap-2 text-gray-300">
                <Gem className="w-4 h-4 text-dm-gold" />
                {treasure}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default SynthesizePage;
