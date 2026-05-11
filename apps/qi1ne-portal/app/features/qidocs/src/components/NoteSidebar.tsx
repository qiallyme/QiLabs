import { useNavigate } from 'react-router-dom';
import { useNotesList } from '../hooks/useNotes';
import { FiFileText, FiHome, FiTag } from 'react-icons/fi';
import { useState } from 'react';

export default function NoteSidebar() {
  const navigate = useNavigate();
  const { data: notes } = useNotesList();
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Extract unique tags
  const allTags = Array.from(
    new Set(notes?.flatMap((note) => note.tags || []) || [])
  ).sort();

  const filteredNotes = selectedTag
    ? notes?.filter((note) => note.tags?.includes(selectedTag))
    : notes;

  return (
    <div className="w-64 glass-card border-r border-slate-800/50 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-800/50">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
        >
          <FiHome />
          <span className="font-semibold">QiNote</span>
        </button>
      </div>

      {/* Note Tree */}
      <div className="flex-1 overflow-auto p-4">
        <div className="mb-4">
          <h3 className="text-xs font-semibold text-slate-400 uppercase mb-2">Recent Notes</h3>
          <div className="space-y-1">
            {filteredNotes?.slice(0, 10).map((note) => (
              <button
                key={note.id}
                onClick={() => navigate(`/note/${note.id}`)}
                className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-slate-300 hover:bg-slate-800/50 rounded transition-colors text-left"
              >
                <FiFileText className="flex-shrink-0" />
                <span className="truncate">{note.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tags */}
        {allTags.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase mb-2 flex items-center gap-1">
              <FiTag />
              Tags
            </h3>
            <div className="space-y-1">
              <button
                onClick={() => setSelectedTag(null)}
                className={`w-full px-2 py-1.5 text-sm rounded transition-colors text-left ${
                  selectedTag === null
                    ? 'bg-indigo-600/20 text-indigo-300'
                    : 'text-slate-400 hover:bg-slate-800/50'
                }`}
              >
                All
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`w-full px-2 py-1.5 text-sm rounded transition-colors text-left ${
                    selectedTag === tag
                      ? 'bg-indigo-600/20 text-indigo-300'
                      : 'text-slate-400 hover:bg-slate-800/50'
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

