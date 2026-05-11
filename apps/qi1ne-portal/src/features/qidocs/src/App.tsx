import { Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import NoteListPage from './routes/NoteListPage';
import NoteEditorPage from './routes/NoteEditorPage';

function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<NoteListPage />} />
        <Route path="/note/:id" element={<NoteEditorPage />} />
      </Routes>
    </ErrorBoundary>
  );
}

export default App;

