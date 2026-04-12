import { useNavigate } from 'react-router-dom';
import { useNotesList } from '../hooks/useNotes';
import { FiFileText, FiPlus } from 'react-icons/fi';

export default function NoteListPage() {
  const navigate = useNavigate();
  const { data: notes, isLoading, error } = useNotesList();

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-900 text-slate-100">
      {/* Header */}
      <header className="glass-card border-b border-slate-800/50 p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            QiNote v2.0
          </h1>
          <button
            onClick={() => navigate('/note/new')}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors"
          >
            <FiPlus />
            New Note
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-auto p-6">
        {error ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-red-400 mb-4">Failed to load notes</div>
            <div className="text-sm text-slate-400 mb-4">
              {error instanceof Error ? error.message : 'Unknown error'}
            </div>
            <div className="text-xs text-slate-500">
              Make sure the backend is running at {import.meta.env.VITE_WORKER_URL || 'http://localhost:7130'}
            </div>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-slate-400">Loading notes...</div>
          </div>
        ) : notes && notes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {notes.map((note) => (
              <button
                key={note.id}
                onClick={() => navigate(`/note/${note.id}`)}
                className="glass-card rounded-xl p-4 text-left hover:bg-slate-800/70 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <FiFileText className="text-indigo-400 mt-1 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-100 truncate">{note.title}</h3>
                    <p className="text-sm text-slate-400 mt-1 line-clamp-2">
                      {note.content_md.substring(0, 100)}
                    </p>
                    {note.tags && note.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {note.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="text-xs px-2 py-0.5 bg-slate-700/50 text-slate-300 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <FiFileText className="text-6xl text-slate-700 mb-4" />
            <h2 className="text-xl font-semibold text-slate-300 mb-2">No notes yet</h2>
            <p className="text-slate-400 mb-4">Create your first note to get started</p>
            <button
              onClick={() => navigate('/note/new')}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500"
            >
              Create Note
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

