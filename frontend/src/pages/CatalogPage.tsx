import { useState, useEffect, useCallback } from 'react';
import { Search, Filter, X } from 'lucide-react';
import BookCard from '../components/BookCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { getBooks, getCategories } from '../api/books';
import type { Book, Page } from '../types';

export default function CatalogPage() {
  const [books, setBooks] = useState<Page<Book> | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [query, setQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [category, setCategory] = useState('');
  const [available, setAvailable] = useState<boolean | undefined>(undefined);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getBooks({ query, category, available, page, size: 12 });
      setBooks(data);
    } finally {
      setLoading(false);
    }
  }, [query, category, available, page]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setQuery(searchInput);
    setPage(0);
  }

  function clearFilters() {
    setSearchInput('');
    setQuery('');
    setCategory('');
    setAvailable(undefined);
    setPage(0);
  }

  const hasFilters = query || category || available !== undefined;

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-[#1B4332] mb-2">Book Catalog</h1>
          <p className="text-stone-500">Browse and borrow from our collection</p>
        </div>

        {/* Search + Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-4 mb-6">
          <form onSubmit={handleSearch} className="flex gap-3 mb-4">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by title, author, or ISBN..."
                className="w-full pl-10 pr-4 py-2.5 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#52B788] focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              className="bg-[#2D6A4F] hover:bg-[#1B4332] text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
            >
              Search
            </button>
          </form>

          <div className="flex flex-wrap gap-3 items-center">
            <Filter size={16} className="text-stone-400" />
            <select
              value={category}
              onChange={(e) => { setCategory(e.target.value); setPage(0); }}
              className="border border-stone-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#52B788]"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <select
              value={available === undefined ? '' : String(available)}
              onChange={(e) => {
                const v = e.target.value;
                setAvailable(v === '' ? undefined : v === 'true');
                setPage(0);
              }}
              className="border border-stone-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#52B788]"
            >
              <option value="">All Availability</option>
              <option value="true">Available Now</option>
              <option value="false">Unavailable</option>
            </select>

            {hasFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-sm text-stone-500 hover:text-red-600 transition-colors"
              >
                <X size={14} /> Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <LoadingSpinner text="Loading books..." />
        ) : books && books.content.length > 0 ? (
          <>
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-stone-500">{books.totalElements} books found</p>
              <p className="text-sm text-stone-500">Page {books.number + 1} of {books.totalPages}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 mb-8">
              {books.content.map((book) => (
                <BookCard key={book.id} book={book} onAction={fetchBooks} />
              ))}
            </div>

            {/* Pagination */}
            {books.totalPages > 1 && (
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => setPage((p) => p - 1)}
                  disabled={books.number === 0}
                  className="px-4 py-2 border border-stone-300 rounded-lg text-sm disabled:opacity-40 hover:bg-stone-50 transition-colors"
                >
                  Previous
                </button>
                {Array.from({ length: Math.min(books.totalPages, 7) }, (_, i) => {
                  const pageNum = books.totalPages <= 7
                    ? i
                    : books.number < 4
                      ? i
                      : books.number > books.totalPages - 4
                        ? books.totalPages - 7 + i
                        : books.number - 3 + i;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`px-4 py-2 border rounded-lg text-sm transition-colors ${
                        pageNum === books.number
                          ? 'bg-[#2D6A4F] text-white border-[#2D6A4F]'
                          : 'border-stone-300 hover:bg-stone-50'
                      }`}
                    >
                      {pageNum + 1}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={books.number === books.totalPages - 1}
                  className="px-4 py-2 border border-stone-300 rounded-lg text-sm disabled:opacity-40 hover:bg-stone-50 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 text-stone-400">
            <Search size={48} className="mx-auto mb-4 opacity-40" />
            <p className="text-lg font-medium">No books found</p>
            <p className="text-sm mt-1">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
