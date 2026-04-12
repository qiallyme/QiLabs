import { useParams } from 'react-router-dom';
import { useState } from 'react';
import NoteSidebar from '../components/NoteSidebar';
import EditorShell from '../components/EditorShell';
import RightPanel from '../components/RightPanel';

export default function NoteEditorPage() {
  const { id } = useParams<{ id: string }>();
  const [rightPanelOpen, setRightPanelOpen] = useState(true);

  const isNewNote = id === 'new' || !id;

  return (
    <div className="h-screen w-screen flex bg-slate-900 text-slate-100">
      {/* Left Sidebar */}
      <NoteSidebar />

      {/* Center Editor */}
      <div className="flex-1 flex flex-col min-w-0">
        <EditorShell noteId={isNewNote ? null : id || null} />
      </div>

      {/* Right Panel */}
      {rightPanelOpen && (
        <RightPanel
          noteId={isNewNote ? null : id || null}
          onClose={() => setRightPanelOpen(false)}
        />
      )}

      {/* Toggle Right Panel */}
      {!rightPanelOpen && (
        <button
          onClick={() => setRightPanelOpen(true)}
          className="fixed right-4 top-1/2 -translate-y-1/2 px-3 py-2 glass-card rounded-l-lg border-r-0"
          title="Open right panel"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}
    </div>
  );
}

