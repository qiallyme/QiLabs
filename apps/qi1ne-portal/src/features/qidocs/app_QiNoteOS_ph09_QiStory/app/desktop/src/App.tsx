import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import ToastContainer from './components/ToastContainer'
import Library from './routes/Library'
import Books from './routes/Books'
import BookDetail from './routes/BookDetail'
import BookWizard from './routes/BookWizard'
import OutlineStudio from './routes/OutlineStudio'
import DraftingStudio from './routes/DraftingStudio'
import Settings from './routes/Settings'

function App() {
  return (
    <BrowserRouter>
      <ToastContainer>
        <Layout>
          <Routes>
            <Route path="/" element={<Library />} />
            <Route path="/books" element={<Books />} />
            <Route path="/books/:id" element={<BookDetail />} />
            <Route path="/books/:id/wizard" element={<BookWizard />} />
            <Route path="/books/:id/outline" element={<OutlineStudio />} />
            <Route path="/books/:id/draft/:nodeId?" element={<DraftingStudio />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/books/:id/settings" element={<Settings />} />
          </Routes>
        </Layout>
      </ToastContainer>
    </BrowserRouter>
  )
}

export default App

