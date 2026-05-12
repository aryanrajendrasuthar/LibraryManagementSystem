import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Edit2, Trash2, X, Loader } from 'lucide-react';
import { getBooks, createBook, updateBook, deleteBook, isbnLookup, getCategories } from '../../api/books';
import LoadingSpinner from '../../components/LoadingSpinner';
import type { Book, Page } from '../../types';

interface BookForm {
  isbn: string;
  title: string;
  author: string;
  category: string;
  publisher: string;
  publishedYear: string;
  totalCopies: string;
  description: string;
  coverUrl: string;
}

const EMPTY_FORM: BookForm = {
  isbn: '', title: '', author: '', category: '', publisher: '',
  publishedYear: '', totalCopies: '1', description: '', coverUrl: '',
};

export default function BookManagement() {
  const [books, setBooks] = useState<Page<Book> | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [query, setQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [form, setForm] = useState<BookForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [isbnLoading, setIsbnLoading] = useState(false);
  const [error, setError] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getBooks({ query, page, size: 10 });
      setBooks(data);
    } finally {
      setLoading(false);
    }
  }, [query, page]);

  useEffect(() => { fetchBooks(); }, [fetchBooks]);
  useEffect(() => { getCategories().then(setCategories); }, []);

  function openAdd() {
    setEditingBook(null);
    setForm(EMPTY_FORM);
    setError('');
    setShowModal(true);
  }

  function openEdit(book: Book) {
    setEditingBook(book);
    setForm({
      isbn: book.isbn || '',
      title: book.title,
      author: book.author,
      category: book.category || '',
      publisher: book.publisher || '',
      publishedYear: book.publishedYear ? String(book.publishedYear) : '',
      totalCopies: String(book.totalCopies),
      description: book.description || '',
      coverUrl: book.coverUrl || '',
    });
    setError('');
    setShowModal(true);
  }

  async function handleIsbnLookup() {
    if (!form.isbn) return;
    setIsbnLoading(true);
    try {
      const info = await isbnLookup(form.isbn);
      setForm((f) => ({
        ...f,
        title: info.title || f.title,
        author: info.author || f.author,
        publisher: info.publisher || f.publisher,
        publishedYear: info.publishedYear ? String(info.publishedYear) : f.publishedYear,
        coverUrl: info.coverUrl || f.coverUrl,
        category: info.category || f.category,
      }));
    } catch {
      setError('ISBN not found in Open Library');
    } finally {
      setIsbnLoading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    const payload = {
      isbn: form.isbn,
      title: form.title,
      author: form.author,
      category: form.category,
      publisher: form.publisher,
      publishedYear: form.publishedYear ? Number(form.publishedYear) : undefined,
      totalCopies: Number(form.totalCopies),
      description: form.description,
      coverUrl: form.coverUrl,
    };
    try {
      if (editingBook) {
        await updateBook(editingBook.id, payload);
      } else {
        await createBook(payload);
      }
      setShowModal(false);
      fetchBooks();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } } };
      setError(e.response?.data?.detail || 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    setDeleteId(id);
    try {
      await deleteBook(id);
      fetchBooks();
    } finally {
      setDeleteId(null);
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold text-[#1B4332]">Book Management</h1>
            <p className="text-stone-500 mt-1">Add, edit, and manage library books</p>
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 bg-[#2D6A4F] hover:bg-[#1B4332] text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus size={16} /> Add Book
          </button>
        </div>

        {/* Search */}
        <form
          onSubmit={(e) => { e.preventDefault(); setQuery(searchInput); setPage(0); }}
          className="bg-white rounded-xl shadow-sm border border-stone-200 p-4 mb-6 flex gap-3"
        >
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search books..."
              className="w-full pl-9 pr-4 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#52B788]"
            />
          </div>
          <button type="submit" className="bg-[#2D6A4F] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#1B4332] transition-colors">
            Search
          </button>
        </form>

        {/* Table */}
        {loading ? (
          <LoadingSpinner text="Loading books..." />
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-stone-50 border-b border-stone-200">
                <tr>
                  <th className="text-left px-4 py-3 text-stone-600 font-medium">Book</th>
                  <th className="text-left px-4 py-3 text-stone-600 font-medium hidden md:table-cell">Category</th>
                  <th className="text-left px-4 py-3 text-stone-600 font-medium hidden lg:table-cell">ISBN</th>
                  <th className="text-center px-4 py-3 text-stone-600 font-medium">Copies</th>
                  <th className="text-center px-4 py-3 text-stone-600 font-medium">Available</th>
                  <th className="text-right px-4 py-3 text-stone-600 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {books?.content.map((book) => (
                  <tr key={book.id} className="hover:bg-stone-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-[#1B4332]">{book.title}</p>
                      <p className="text-stone-400 text-xs">{book.author}</p>
                    </td>
                    <td className="px-4 py-3 text-stone-500 hidden md:table-cell">{book.category}</td>
                    <td className="px-4 py-3 text-stone-400 text-xs hidden lg:table-cell">{book.isbn}</td>
                    <td className="px-4 py-3 text-center text-stone-600">{book.totalCopies}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${book.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {book.availableCopies}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(book)}
                          className="text-stone-400 hover:text-[#2D6A4F] transition-colors p-1"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(book.id)}
                          disabled={deleteId === book.id}
                          className="text-stone-400 hover:text-red-600 transition-colors p-1 disabled:opacity-40"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {books?.content.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-stone-400">No books found</td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Pagination */}
            {books && books.totalPages > 1 && (
              <div className="flex justify-between items-center px-4 py-3 border-t border-stone-200">
                <p className="text-xs text-stone-400">{books.totalElements} books total</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => p - 1)}
                    disabled={books.number === 0}
                    className="px-3 py-1 border border-stone-300 rounded text-xs disabled:opacity-40 hover:bg-stone-50"
                  >
                    Prev
                  </button>
                  <span className="px-3 py-1 text-xs text-stone-500">{books.number + 1} / {books.totalPages}</span>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={books.number === books.totalPages - 1}
                    className="px-3 py-1 border border-stone-300 rounded text-xs disabled:opacity-40 hover:bg-stone-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-stone-200">
              <h2 className="text-lg font-serif font-semibold text-[#1B4332]">
                {editingBook ? 'Edit Book' : 'Add New Book'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-stone-400 hover:text-stone-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 flex flex-col gap-4">
              {error && <div className="bg-red-50 text-red-700 border border-red-200 rounded-lg p-3 text-sm">{error}</div>}

              {/* ISBN with lookup */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">ISBN</label>
                <div className="flex gap-2">
                  <input
                    value={form.isbn}
                    onChange={(e) => setForm((f) => ({ ...f, isbn: e.target.value }))}
                    placeholder="9780134685991"
                    className="flex-1 border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#52B788]"
                  />
                  <button
                    type="button"
                    onClick={handleIsbnLookup}
                    disabled={isbnLoading || !form.isbn}
                    className="flex items-center gap-1 bg-stone-100 hover:bg-stone-200 text-stone-700 px-3 py-2 rounded-lg text-sm disabled:opacity-50 transition-colors"
                  >
                    {isbnLoading ? <Loader size={14} className="animate-spin" /> : 'Auto-fill'}
                  </button>
                </div>
              </div>

              {[
                { label: 'Title', field: 'title', required: true, placeholder: 'Book title' },
                { label: 'Author', field: 'author', required: true, placeholder: 'Author name' },
                { label: 'Publisher', field: 'publisher', required: false, placeholder: 'Publisher' },
                { label: 'Cover URL', field: 'coverUrl', required: false, placeholder: 'https://...' },
              ].map(({ label, field, required, placeholder }) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-stone-700 mb-1">{label}</label>
                  <input
                    value={form[field as keyof BookForm]}
                    onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                    required={required}
                    placeholder={placeholder}
                    className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#52B788]"
                  />
                </div>
              ))}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Category</label>
                  <input
                    list="category-list"
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    placeholder="Fiction"
                    className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#52B788]"
                  />
                  <datalist id="category-list">
                    {categories.map((c) => <option key={c} value={c} />)}
                  </datalist>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Published Year</label>
                  <input
                    type="number"
                    value={form.publishedYear}
                    onChange={(e) => setForm((f) => ({ ...f, publishedYear: e.target.value }))}
                    placeholder="2024"
                    min="1000" max="2100"
                    className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#52B788]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Total Copies</label>
                <input
                  type="number"
                  value={form.totalCopies}
                  onChange={(e) => setForm((f) => ({ ...f, totalCopies: e.target.value }))}
                  required
                  min="1"
                  className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#52B788]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={3}
                  placeholder="Brief description..."
                  className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#52B788] resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 border border-stone-300 text-stone-600 py-2.5 rounded-lg text-sm hover:bg-stone-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-[#2D6A4F] hover:bg-[#1B4332] text-white py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-60"
                >
                  {saving ? 'Saving...' : editingBook ? 'Update Book' : 'Add Book'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
