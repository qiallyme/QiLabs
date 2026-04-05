import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { InboxPage } from './pages/InboxPage';
import { SearchPage } from './pages/SearchPage';
import { DocumentDetailPage } from './pages/DocumentDetailPage';
import { TagsPage } from './pages/TagsPage';
import { SettingsPage } from './pages/SettingsPage';

export function App() {
    return (
        <BrowserRouter basename="/qivault-docs">
            <Routes>
                <Route path="/" element={<Navigate to="/inbox" replace />} />
                <Route path="/inbox" element={<InboxPage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/document/:id" element={<DocumentDetailPage />} />
                <Route path="/tags" element={<TagsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
            </Routes>
        </BrowserRouter>
    );
}
