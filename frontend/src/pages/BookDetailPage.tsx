import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BookOpen, User, Tag, Calendar, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import { getBook } from '../api/books';
import { borrowBook } from '../api/loans';
import { reserveBook } from '../api/reservations';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import type { Book } from '../types';

export default function BookDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (!id) return;
    getBook(Number(id))
      .then(setBook)
      .finally(() => setLoading(false));
  }, [id]);

  async function handleBorrow() {
    if (!book) return;
    setActionLoading(true);
    setMessage(null);
    try {
      await borrowBook(book.id);
      setMessage({ text: 'Book borrowed successfully! Check your dashboard for due date.', type: 'success' });
      const updated = await getBook(book.id);
      setBook(updated);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { detail?: string } } };
      setMessage({ text: err.response?.data?.detail || 'Failed to borrow book', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  }

  async function handleReserve() {
    if (!book) return;
    setActionLoading(true);
    setMessage(null);
    try {
      await reserveBook(book.id);
      setMessage({ text: 'Reserved! You will be notified when the book becomes available.', type: 'success' });
    } catch (e: unknown) {
      const err = e as { response?: { data?: { detail?: string } } };
      setMessage({ text: err.response?.data?.detail || 'Failed to reserve book', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) return <div className="min-h-screen bg-[#FAF7F2]"><LoadingSpinner text="Loading book..." /></div>;
  if (!book) return (
    <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
      <div className="text-center">
        <p className="text-stone-500 text-lg">Book not found</p>
        <button onClick={() => navigate('/catalog')} className="mt-4 text-[#2D6A4F] hover:underline text-sm">Back to catalog</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-stone-500 hover:text-[#1B4332] transition-colors mb-6 text-sm"
        >
          <ArrowLeft size={16} /> Back
        </button>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="md:flex">
            {/* Cover */}
            <div className="md:w-64 h-80 md:h-auto bg-[#2D6A4F] flex items-center justify-center flex-shrink-0">
              {book.coverUrl ? (
                <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" />
              ) : (
                <BookOpen size={80} className="text-[#52B788] opacity-60" />
              )}
            </div>

            {/* Details */}
            <div className="p-8 flex-1">
              <div className="mb-6">
                <h1 className="text-2xl font-serif font-bold text-[#1B4332] mb-2">{book.title}</h1>

                <div className="flex flex-col gap-2 text-stone-600">
                  <p className="flex items-center gap-2">
                    <User size={16} className="text-stone-400" />
                    <span className="font-medium">{book.author}</span>
                  </p>
                  {book.category && (
                    <p className="flex items-center gap-2">
                      <Tag size={16} className="text-stone-400" />
                      <span className="text-sm bg-stone-100 px-2 py-0.5 rounded">{book.category}</span>
                    </p>
                  )}
                  {book.isbn && (
                    <p className="text-sm text-stone-400">ISBN: {book.isbn}</p>
                  )}
                  {book.publishedYear && (
                    <p className="flex items-center gap-2 text-sm text-stone-500">
                      <Calendar size={14} className="text-stone-400" />
                      Published {book.publishedYear}
                    </p>
                  )}
                  {book.publisher && (
                    <p className="text-sm text-stone-500">{book.publisher}</p>
                  )}
                </div>
              </div>

              {book.description && (
                <p className="text-stone-600 text-sm leading-relaxed mb-6 border-t border-stone-100 pt-4">
                  {book.description}
                </p>
              )}

              {/* Availability */}
              <div className="flex items-center gap-3 mb-6">
                {book.available ? (
                  <span className="flex items-center gap-2 text-green-700 font-medium bg-green-50 px-3 py-1.5 rounded-lg">
                    <CheckCircle size={16} />
                    {book.availableCopies} of {book.totalCopies} copies available
                  </span>
                ) : (
                  <span className="flex items-center gap-2 text-red-600 font-medium bg-red-50 px-3 py-1.5 rounded-lg">
                    <XCircle size={16} />
                    All {book.totalCopies} copies checked out
                  </span>
                )}
              </div>

              {/* Message */}
              {message && (
                <div className={`mb-4 p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                  {message.text}
                </div>
              )}

              {/* Actions */}
              {isAuthenticated && (
                <div className="flex gap-3">
                  {book.available ? (
                    <button
                      onClick={handleBorrow}
                      disabled={actionLoading}
                      className="bg-[#2D6A4F] hover:bg-[#1B4332] text-white px-6 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-60"
                    >
                      {actionLoading ? 'Processing...' : 'Borrow Now'}
                    </button>
                  ) : (
                    <button
                      onClick={handleReserve}
                      disabled={actionLoading}
                      className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-60"
                    >
                      {actionLoading ? 'Processing...' : 'Join Waitlist'}
                    </button>
                  )}
                </div>
              )}
              {!isAuthenticated && (
                <p className="text-sm text-stone-500">
                  <a href="/login" className="text-[#2D6A4F] font-medium hover:underline">Sign in</a> to borrow or reserve this book.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
