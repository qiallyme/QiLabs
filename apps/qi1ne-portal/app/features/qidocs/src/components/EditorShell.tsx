import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNote, useCreateNote, useUpdateNote, useIngestNote } from '../hooks/useNotes';
import { FiSave } from 'react-icons/fi';
import MarkdownIt from 'markdown-it';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const md = new MarkdownIt();

// Strip YAML front matter for preview (keep it in editor)
function stripFrontMatter(content: string): string {
  if (!content) return content;
  const trimmed = content.trim();
  if (trimmed.startsWith('---')) {
    const endIndex = trimmed.indexOf('\n---', 3);
    if (endIndex !== -1) {
      return trimmed.substring(endIndex + 5).trim();
    }
  }
  return content;
}

interface EditorShellProps {
  noteId: string | null;
}

export default function EditorShell({ noteId }: EditorShellProps) {
  const navigate = useNavigate();
  const { data: note, isLoading } = useNote(noteId || '');
  const createNote = useCreateNote();
  const updateNote = useUpdateNote();
  const ingestNote = useIngestNote();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mode, setMode] = useState<'markdown' | 'preview' | 'split'>('markdown');
  const [saving, setSaving] = useState(false);
  const [ingestionId, setIngestionId] = useState<string | null>(null);

  // Load note data
  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content_md || '');
    } else if (!noteId) {
      // New note
      setTitle('');
      setContent('');
    }
  }, [note, noteId]);

  const handleSave = async () => {
    if (!title.trim()) return;

    setSaving(true);
    try {
      const contentHtml = md.render(content);
      const realm = note?.realm || 'QiPersonal';
      const slug = note?.slug || title.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');

      if (noteId && noteId !== 'new') {
        // Update existing note
        const updatedNote = await updateNote.mutateAsync({
          id: noteId,
          data: {
            title: title.trim(),
            content_md: content,
            content_html: contentHtml,
          },
        });

        // Trigger ingestion with correct format
        const ingestResult = await ingestNote.mutateAsync({
          file_path: `notes/${noteId}.md`,
          slug: updatedNote.slug || slug,
          mime_type: 'text/markdown',
          file_ext: 'md',
          content: content,
          realm: realm,
          qid: noteId,
          meta: {
            source_type: 'note',
            source_id: noteId,
            title: title.trim(),
            tags: updatedNote.tags || [],
            sensitivity: updatedNote.sensitivity || 'internal',
          },
        });

        setIngestionId(ingestResult.id);
      } else {
        // Create new note
        const newNote = await createNote.mutateAsync({
          title: title.trim(),
          slug: slug,
          realm: realm,
          content_md: content,
          content_html: contentHtml,
          tags: [],
          sensitivity: 'internal',
        });

        // Trigger ingestion with correct format
        const ingestResult = await ingestNote.mutateAsync({
          file_path: `notes/${newNote.id}.md`,
          slug: newNote.slug,
          mime_type: 'text/markdown',
          file_ext: 'md',
          content: content,
          realm: realm,
          qid: newNote.id,
          meta: {
            source_type: 'note',
            source_id: newNote.id,
            title: title.trim(),
            tags: newNote.tags || [],
            sensitivity: newNote.sensitivity || 'internal',
          },
        });

        setIngestionId(ingestResult.id);
        
        // Navigate to the new note
        navigate(`/note/${newNote.id}`, { replace: true });
      }
    } catch (error) {
      console.error('Failed to save note:', error);
      alert('Failed to save note. Check console for details.');
    } finally {
      setSaving(false);
    }
  };

  if (isLoading && noteId && noteId !== 'new') {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-slate-400">Loading note...</div>
      </div>
    );
  }

  if (!noteId || noteId === 'new') {
    // New note mode
    return (
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="glass-card border-b border-slate-800/50 p-4">
          <div className="flex items-center justify-between mb-3">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note title..."
              className="flex-1 bg-transparent text-xl font-semibold text-slate-100 placeholder-slate-500 focus:outline-none"
            />
            <div className="flex items-center gap-2">
              {/* Mode toggle */}
              <div className="flex glass-card rounded-lg p-1">
                <button
                  onClick={() => setMode('markdown')}
                  className={`px-3 py-1 text-sm rounded transition-colors ${
                    mode === 'markdown'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Markdown
                </button>
                <button
                  onClick={() => setMode('preview')}
                  className={`px-3 py-1 text-sm rounded transition-colors ${
                    mode === 'preview'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Preview
                </button>
                <button
                  onClick={() => setMode('split')}
                  className={`px-3 py-1 text-sm rounded transition-colors ${
                    mode === 'split'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Split
                </button>
              </div>
              <button
                onClick={handleSave}
                disabled={saving || !title.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <FiSave />
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 flex overflow-hidden">
          {(mode === 'markdown' || mode === 'split') && (
            <div className={mode === 'split' ? 'flex-1 border-r border-slate-800/50' : 'flex-1'}>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your note in Markdown..."
                className="w-full h-full p-6 bg-transparent text-slate-100 placeholder-slate-500 resize-none focus:outline-none font-mono text-sm"
              />
            </div>
          )}
          {(mode === 'preview' || mode === 'split') && (
            <div className={mode === 'split' ? 'flex-1 overflow-auto' : 'flex-1 overflow-auto'}>
              <div className="p-6 prose prose-invert prose-slate max-w-none prose-headings:font-bold prose-h1:text-4xl prose-h2:text-3xl prose-h3:text-2xl prose-h4:text-xl">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {stripFrontMatter(content) || '_Nothing here yet..._'}
                </ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="glass-card border-b border-slate-800/50 p-4">
        <div className="flex items-center justify-between mb-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note title..."
            className="flex-1 bg-transparent text-xl font-semibold text-slate-100 placeholder-slate-500 focus:outline-none"
          />
          <div className="flex items-center gap-2">
            {/* Mode toggle */}
            <div className="flex glass-card rounded-lg p-1">
              <button
                onClick={() => setMode('markdown')}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  mode === 'markdown'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Markdown
              </button>
              <button
                onClick={() => setMode('preview')}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  mode === 'preview'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Preview
              </button>
              <button
                onClick={() => setMode('split')}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  mode === 'split'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Split
              </button>
            </div>
            <button
              onClick={handleSave}
              disabled={saving || !title.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <FiSave />
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>

        {/* Ingestion status */}
        {ingestionId && (
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
            Indexing...
          </div>
        )}
      </div>

      {/* Editor */}
      <div className="flex-1 flex overflow-hidden">
        {(mode === 'markdown' || mode === 'split') && (
          <div className={mode === 'split' ? 'flex-1 border-r border-slate-800/50' : 'flex-1'}>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your note in Markdown..."
              className="w-full h-full p-6 bg-transparent text-slate-100 placeholder-slate-500 resize-none focus:outline-none font-mono text-sm"
            />
          </div>
        )}
        {(mode === 'preview' || mode === 'split') && (
          <div className={mode === 'split' ? 'flex-1 overflow-auto' : 'flex-1 overflow-auto'}>
            <div className="p-6 prose prose-invert prose-slate max-w-none prose-headings:font-bold prose-h1:text-4xl prose-h2:text-3xl prose-h3:text-2xl prose-h4:text-xl">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {stripFrontMatter(content) || '_Nothing here yet..._'}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

