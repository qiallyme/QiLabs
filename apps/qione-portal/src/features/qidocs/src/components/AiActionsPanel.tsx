import { useState } from 'react';
import { useNote, useNoteAssist } from '../hooks/useNotes';
import { FiZap, FiEdit3, FiList, FiTag, FiMessageCircle } from 'react-icons/fi';
import type { NoteAssistRequest } from '../types/note';

interface AiActionsPanelProps {
  noteId: string | null;
}

export default function AiActionsPanel({ noteId }: AiActionsPanelProps) {
  const { data: note } = useNote(noteId || '');
  const noteAssist = useNoteAssist();
  const [activeIntent, setActiveIntent] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleAction = async (intent: NoteAssistRequest['intent']) => {
    if (!note) return;

    setLoading(true);
    setActiveIntent(intent);
    setResult(null);

    try {
      const response = await noteAssist.mutateAsync({
        intent,
        note: {
          id: note.id,
          title: note.title,
          realm: note.realm,
          content_md: note.content_md,
          tags: note.tags,
        },
      });

      setResult(response);
    } catch (error: any) {
      console.error('AI action failed:', error);
      
      // Extract better error message
      let errorMessage = 'Failed to process request.';
      if (error?.message) {
        errorMessage = error.message;
      } else if (error?.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      // Check for common issues
      if (errorMessage.includes('OpenAI') || errorMessage.includes('API key') || errorMessage.includes('503')) {
        errorMessage = 'OpenAI API not configured. Please set OPENAI_API_KEY in your backend .env file.';
      }
      
      setResult({ error: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const actions = [
    { intent: 'summarize' as const, icon: FiZap, label: 'Summarize' },
    { intent: 'rewrite' as const, icon: FiEdit3, label: 'Rewrite' },
    { intent: 'outline' as const, icon: FiList, label: 'Outline' },
    { intent: 'tag' as const, icon: FiTag, label: 'Suggest Tags' },
    { intent: 'qa' as const, icon: FiMessageCircle, label: 'Ask About Note' },
  ];

  return (
    <div className="p-4 space-y-4">
      <h3 className="text-sm font-semibold text-slate-300 uppercase">AI Actions</h3>

      {/* Action Buttons */}
      <div className="space-y-2">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.intent}
              onClick={() => handleAction(action.intent)}
              disabled={!note || loading}
              className="w-full flex items-center gap-3 px-4 py-3 glass-card rounded-lg hover:bg-slate-800/70 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Icon className="text-indigo-400" />
              <span className="text-slate-200">{action.label}</span>
            </button>
          );
        })}
      </div>

      {/* Result Display */}
      {loading && (
        <div className="p-4 glass-card rounded-lg">
          <div className="text-slate-400 text-sm">Processing...</div>
        </div>
      )}

      {result && !loading && (
        <div className="p-4 glass-card rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-slate-200">
              {activeIntent === 'summarize' && 'Summary'}
              {activeIntent === 'rewrite' && 'Rewritten'}
              {activeIntent === 'outline' && 'Outline'}
              {activeIntent === 'tag' && 'Suggested Tags'}
              {activeIntent === 'qa' && 'Answer'}
            </h4>
            <button
              onClick={() => setResult(null)}
              className="text-xs text-slate-400 hover:text-slate-200"
            >
              Clear
            </button>
          </div>

          {result.error ? (
            <div className="text-sm text-red-400">{result.error}</div>
          ) : (
            <div className="space-y-2">
              {result.summary_md && (
                <div
                  className="prose prose-invert prose-slate prose-sm max-w-none text-slate-300"
                  dangerouslySetInnerHTML={{
                    __html: result.summary_md.replace(/\n/g, '<br />'),
                  }}
                />
              )}
              {result.rewritten_md && (
                <div className="text-slate-300 whitespace-pre-wrap text-sm">
                  {result.rewritten_md}
                </div>
              )}
              {result.outline_md && (
                <div className="text-slate-300 whitespace-pre-wrap text-sm font-mono">
                  {result.outline_md}
                </div>
              )}
              {result.suggested_tags && (
                <div className="flex flex-wrap gap-2">
                  {result.suggested_tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-indigo-600/20 text-indigo-300 rounded text-sm"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
              {result.answer_md && (
                <div
                  className="prose prose-invert prose-slate prose-sm max-w-none text-slate-300"
                  dangerouslySetInnerHTML={{
                    __html: result.answer_md.replace(/\n/g, '<br />'),
                  }}
                />
              )}

              {/* Action buttons */}
              <div className="flex gap-2 pt-2 border-t border-slate-700/50">
                <button className="flex-1 px-3 py-1.5 text-xs bg-indigo-600/20 text-indigo-300 rounded hover:bg-indigo-600/30 transition-colors">
                  Copy
                </button>
                <button className="flex-1 px-3 py-1.5 text-xs bg-indigo-600/20 text-indigo-300 rounded hover:bg-indigo-600/30 transition-colors">
                  Insert
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {!note && (
        <div className="p-4 glass-card rounded-lg text-sm text-slate-400 text-center">
          Open a note to use AI actions
        </div>
      )}
    </div>
  );
}

