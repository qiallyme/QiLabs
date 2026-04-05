import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { projectApi } from '../lib/api'

interface Book {
  id: string
  working_title: string
  status: string
  created_at: string
}

export default function Books() {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [importing, setImporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    loadBooks()
  }, [])

  async function loadBooks() {
    try {
      const response = await axios.get('/api/books')
      setBooks(response.data.books || [])
    } catch (error) {
      console.error('Failed to load books:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleImport(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    
    setImporting(true)
    try {
      const response = await projectApi.import(file)
      alert(`Project imported successfully! Book ID: ${response.data.book_id}`)
      await loadBooks()
      // Navigate to the imported book
      navigate(`/books/${response.data.book_id}`)
    } catch (error: any) {
      console.error('Failed to import project:', error)
      alert(error.response?.data?.detail || 'Failed to import project')
    } finally {
      setImporting(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <h1>Books</h1>
      <div style={{ marginTop: '2rem', marginBottom: '1rem' }}>
        <input
          type="file"
          ref={fileInputRef}
          accept=".zip"
          onChange={handleImport}
          style={{ display: 'none' }}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={importing}
          style={{ padding: '0.5rem 1rem', marginBottom: '1rem' }}
        >
          {importing ? 'Importing...' : 'Import Project'}
        </button>
      </div>
      <div style={{ marginTop: '2rem' }}>
        {books.length === 0 ? (
          <p>No books yet. Create a new book to get started.</p>
        ) : (
          <ul>
            {books.map(book => (
              <li key={book.id}>
                <Link to={`/books/${book.id}`}>
                  {book.working_title} ({book.status})
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

