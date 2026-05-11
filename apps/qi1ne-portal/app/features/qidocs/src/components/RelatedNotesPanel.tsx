import { useNavigate } from 'react-router-dom';
import { useRelatedNotes } from '../hooks/useNotes';
import { FiFileText } from 'react-icons/fi';

interface RelatedNotesPanelProps {
  noteId: string | null;
}

export default function RelatedNotesPanel({ noteId }: RelatedNotesPanelProps) {
  const navigate = useNavigate();
  const { data: queryData, isLoading } = useRelatedNotes(noteId);

  if (!noteId) {
    return (
      <div className="p-4 text-sm text-slate-400 text-center">
        Open a note to see related notes
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-4 text-sm text-slate-400 text-center">Loading related notes...</div>
    );
  }

  const results = queryData?.results || [];

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-sm font-semibold text-slate-300 uppercase">Related Notes</h3>

      {results.length === 0 ? (
        <div className="text-sm text-slate-400 text-center py-8">
          No related notes found
        </div>
      ) : (
        <div className="space-y-2">
          {results.map((result) => (
            <button
              key={result.note_id}
              onClick={() => navigate(`/note/${result.note_id}`)}
              className="w-full p-3 glass-card rounded-lg hover:bg-slate-800/70 transition-colors text-left"
            >
              <div className="flex items-start gap-2">
                <FiFileText className="text-indigo-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-slate-200 truncate">{result.title}</div>
                  {result.snippet_md && (
                    <div className="text-xs text-slate-400 mt-1 line-clamp-2">
                      {result.snippet_md}
                    </div>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-slate-500">{result.realm}</span>
                    {result.tags && result.tags.length > 0 && (
                      <div className="flex gap-1">
                        {result.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="text-xs px-1.5 py-0.5 bg-slate-700/50 text-slate-400 rounded"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

