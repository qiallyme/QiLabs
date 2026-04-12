import { useState } from 'react';
import { FiX } from 'react-icons/fi';
import AiActionsPanel from './AiActionsPanel';
import RelatedNotesPanel from './RelatedNotesPanel';
import NoteMetadataPanel from './NoteMetadataPanel';

interface RightPanelProps {
  noteId: string | null;
  onClose: () => void;
}

export default function RightPanel({ noteId, onClose }: RightPanelProps) {
  const [activeTab, setActiveTab] = useState<'ai' | 'related' | 'metadata'>('ai');

  return (
    <div className="w-80 glass-card border-l border-slate-800/50 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-800/50 flex items-center justify-between">
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab('ai')}
            className={`px-3 py-1 text-sm rounded transition-colors ${
              activeTab === 'ai'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            AI
          </button>
          <button
            onClick={() => setActiveTab('related')}
            className={`px-3 py-1 text-sm rounded transition-colors ${
              activeTab === 'related'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Related
          </button>
          <button
            onClick={() => setActiveTab('metadata')}
            className={`px-3 py-1 text-sm rounded transition-colors ${
              activeTab === 'metadata'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Info
          </button>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-200 transition-colors"
        >
          <FiX />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'ai' && <AiActionsPanel noteId={noteId} />}
        {activeTab === 'related' && <RelatedNotesPanel noteId={noteId} />}
        {activeTab === 'metadata' && <NoteMetadataPanel noteId={noteId} />}
      </div>
    </div>
  );
}

