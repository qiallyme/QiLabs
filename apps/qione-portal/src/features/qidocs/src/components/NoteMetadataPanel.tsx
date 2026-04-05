import { useState } from 'react';
import { useNote, useUpdateNote } from '../hooks/useNotes';
import { FiTag, FiLock, FiFolder } from 'react-icons/fi';

interface NoteMetadataPanelProps {
  noteId: string | null;
}

export default function NoteMetadataPanel({ noteId }: NoteMetadataPanelProps) {
  const { data: note } = useNote(noteId || '');
  const updateNote = useUpdateNote();
  const [editingTags, setEditingTags] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const handleAddTag = async () => {
    if (!note || !tagInput.trim()) return;

    const newTags = [...(note.tags || []), tagInput.trim()];
    await updateNote.mutateAsync({
      id: note.id,
      data: { tags: newTags },
    });

    setTagInput('');
  };

  const handleRemoveTag = async (tagToRemove: string) => {
    if (!note) return;

    const newTags = (note.tags || []).filter((tag) => tag !== tagToRemove);
    await updateNote.mutateAsync({
      id: note.id,
      data: { tags: newTags },
    });
  };

  if (!note) {
    return (
      <div className="p-4 text-sm text-slate-400 text-center">
        Open a note to see metadata
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Realm */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <FiFolder className="text-slate-400" />
          <h4 className="text-sm font-semibold text-slate-300">Realm</h4>
        </div>
        <div className="text-sm text-slate-200">{note.realm}</div>
      </div>

      {/* Tags */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <FiTag className="text-slate-400" />
            <h4 className="text-sm font-semibold text-slate-300">Tags</h4>
          </div>
          <button
            onClick={() => setEditingTags(!editingTags)}
            className="text-xs text-indigo-400 hover:text-indigo-300"
          >
            {editingTags ? 'Done' : 'Edit'}
          </button>
        </div>

        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {note.tags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1 px-2 py-1 bg-slate-700/50 text-slate-300 rounded text-sm"
              >
                #{tag}
                {editingTags && (
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="text-slate-500 hover:text-red-400"
                  >
                    ×
                  </button>
                )}
              </span>
            ))}
          </div>
        )}

        {editingTags && (
          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleAddTag();
                }
              }}
              placeholder="Add tag..."
              className="flex-1 px-2 py-1 bg-slate-800/50 border border-slate-700/50 rounded text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50"
            />
            <button
              onClick={handleAddTag}
              className="px-3 py-1 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-500"
            >
              Add
            </button>
          </div>
        )}
      </div>

      {/* Sensitivity */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <FiLock className="text-slate-400" />
          <h4 className="text-sm font-semibold text-slate-300">Sensitivity</h4>
        </div>
        <div className="text-sm text-slate-200 capitalize">{note.sensitivity || 'internal'}</div>
      </div>

      {/* Backlinks */}
      {note.backlinks && note.backlinks.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-slate-300 mb-2">Backlinks</h4>
          <div className="space-y-1">
            {note.backlinks.map((backlink) => (
              <div key={backlink} className="text-sm text-slate-400">
                → {backlink}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Timestamps */}
      <div className="pt-4 border-t border-slate-700/50 space-y-1">
        <div className="text-xs text-slate-500">
          Created: {new Date(note.created_at).toLocaleDateString()}
        </div>
        <div className="text-xs text-slate-500">
          Updated: {new Date(note.updated_at).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}

