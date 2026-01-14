import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import {
  ChevronRight,
  ChevronDown,
  Search,
  Loader2,
  BookOpen,
  X,
  Sparkles
} from 'lucide-react';
import { getContentStructure, getChapterContent, searchChapters } from '../services/api';
import type { ContentStructure, Chapter, Act } from '../types';

function ChaptersPage() {
  const navigate = useNavigate();
  const [structure, setStructure] = useState<ContentStructure | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedActs, setExpandedActs] = useState<Set<string>>(new Set());
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [chapterContent, setChapterContent] = useState<string | null>(null);
  const [loadingContent, setLoadingContent] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Chapter[] | null>(null);

  useEffect(() => {
    loadStructure();
  }, []);

  async function loadStructure() {
    setLoading(true);
    const response = await getContentStructure();
    if (response.success && response.data) {
      setStructure(response.data);
      // Expand first act by default
      if (response.data.acts.length > 0) {
        setExpandedActs(new Set([response.data.acts[0].id]));
      }
    } else {
      setError(response.error || 'Failed to load content');
    }
    setLoading(false);
  }

  async function loadChapterContent(chapter: Chapter) {
    setSelectedChapter(chapter);
    setLoadingContent(true);
    const response = await getChapterContent(chapter.path);
    if (response.success && response.data) {
      setChapterContent(response.data.content);
    } else {
      setChapterContent('Failed to load chapter content');
    }
    setLoadingContent(false);
  }

  async function handleSearch(query: string) {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults(null);
      return;
    }
    const response = await searchChapters(query);
    if (response.success && response.data) {
      setSearchResults(response.data);
    }
  }

  function toggleAct(actId: string) {
    const newExpanded = new Set(expandedActs);
    if (newExpanded.has(actId)) {
      newExpanded.delete(actId);
    } else {
      newExpanded.add(actId);
    }
    setExpandedActs(newExpanded);
  }

  function handleSynthesize() {
    if (selectedChapter) {
      navigate('/synthesize', { state: { chapter: selectedChapter } });
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-dm-gold animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-6 text-center">
        <p className="text-dm-accent">{error}</p>
        <button onClick={loadStructure} className="btn-primary mt-4">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-medieval text-dm-gold">Campaign Chapters</h1>
          <p className="text-gray-400 mt-1">Browse and explore the full campaign content</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Chapter List */}
        <div className="lg:col-span-1 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search chapters..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="input w-full pl-10"
            />
          </div>

          {/* Search Results or Structure */}
          <div className="card p-4 max-h-[calc(100vh-280px)] overflow-y-auto">
            {searchResults ? (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-400">
                    {searchResults.length} results
                  </span>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSearchResults(null);
                    }}
                    className="text-gray-500 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-1">
                  {searchResults.map((chapter) => (
                    <ChapterItem
                      key={chapter.id}
                      chapter={chapter}
                      isSelected={selectedChapter?.id === chapter.id}
                      onClick={() => loadChapterContent(chapter)}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Foundation Chapters */}
                {structure?.chapters && structure.chapters.length > 0 && (
                  <div>
                    <h3 className="font-medieval text-dm-gold mb-2">Foundation</h3>
                    <div className="space-y-1">
                      {structure.chapters.map((chapter) => (
                        <ChapterItem
                          key={chapter.id}
                          chapter={chapter}
                          isSelected={selectedChapter?.id === chapter.id}
                          onClick={() => loadChapterContent(chapter)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Acts */}
                {structure?.acts.map((act) => (
                  <ActSection
                    key={act.id}
                    act={act}
                    isExpanded={expandedActs.has(act.id)}
                    onToggle={() => toggleAct(act.id)}
                    selectedChapter={selectedChapter}
                    onSelectChapter={loadChapterContent}
                  />
                ))}

                {/* Appendices */}
                {structure?.appendices && structure.appendices.length > 0 && (
                  <div>
                    <h3 className="font-medieval text-dm-gold mb-2">Appendices</h3>
                    <div className="space-y-1">
                      {structure.appendices.map((chapter) => (
                        <ChapterItem
                          key={chapter.id}
                          chapter={chapter}
                          isSelected={selectedChapter?.id === chapter.id}
                          onClick={() => loadChapterContent(chapter)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Content Preview */}
        <div className="lg:col-span-2">
          <div className="card h-[calc(100vh-200px)] flex flex-col">
            {selectedChapter ? (
              <>
                <div className="p-4 border-b border-dm-gold/20 flex items-center justify-between">
                  <div>
                    <h2 className="font-medieval text-xl text-dm-gold">
                      {selectedChapter.name}
                    </h2>
                    {selectedChapter.act && (
                      <p className="text-sm text-gray-400">{selectedChapter.act}</p>
                    )}
                  </div>
                  <button
                    onClick={handleSynthesize}
                    className="btn-primary flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    Synthesize
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-6">
                  {loadingContent ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="w-6 h-6 text-dm-gold animate-spin" />
                    </div>
                  ) : (
                    <div className="markdown-content">
                      <ReactMarkdown>{chapterContent || ''}</ReactMarkdown>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <BookOpen className="w-12 h-12 mb-4" />
                <p>Select a chapter to preview its content</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface ActSectionProps {
  act: Act;
  isExpanded: boolean;
  onToggle: () => void;
  selectedChapter: Chapter | null;
  onSelectChapter: (chapter: Chapter) => void;
}

function ActSection({
  act,
  isExpanded,
  onToggle,
  selectedChapter,
  onSelectChapter,
}: ActSectionProps) {
  return (
    <div>
      <button
        onClick={onToggle}
        className="flex items-center gap-2 w-full text-left font-medieval text-dm-gold hover:text-dm-accent transition-colors"
      >
        {isExpanded ? (
          <ChevronDown className="w-4 h-4" />
        ) : (
          <ChevronRight className="w-4 h-4" />
        )}
        {act.name}
        <span className="text-xs text-gray-500 ml-auto">
          {act.chapters.length} chapters
        </span>
      </button>
      {isExpanded && (
        <div className="mt-2 ml-4 space-y-1">
          {act.chapters.map((chapter) => (
            <ChapterItem
              key={chapter.id}
              chapter={chapter}
              isSelected={selectedChapter?.id === chapter.id}
              onClick={() => onSelectChapter(chapter)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface ChapterItemProps {
  chapter: Chapter;
  isSelected: boolean;
  onClick: () => void;
}

function ChapterItem({ chapter, isSelected, onClick }: ChapterItemProps) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full text-left px-3 py-2 rounded-lg text-sm transition-all
        ${isSelected
          ? 'bg-dm-blue text-dm-gold'
          : 'text-gray-300 hover:bg-dm-dark/50 hover:text-white'
        }
      `}
    >
      <div className="truncate">{chapter.name}</div>
      {chapter.description && (
        <div className="text-xs text-gray-500 truncate">{chapter.description}</div>
      )}
    </button>
  );
}

export default ChaptersPage;
