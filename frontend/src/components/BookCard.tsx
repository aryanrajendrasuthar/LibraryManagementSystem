import { useState } from 'react';
import { BookOpen, User, Tag, CheckCircle, XCircle } from 'lucide-react';
import type { Book } from '../types';
import { borrowBook } from '../api/loans';
import { reserveBook } from '../api/reservations';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

interface Props {
  book: Book;
  onAction?: () => void;
}

export default function BookCard({ book, onAction }: Props) {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  async function handleBorrow() {
    setLoading(true);
    setMessage(null);
    try {
      await borrowBook(book.id);
      setMessage({ text: 'Book borrowed successfully!', type: 'success' });
      onAction?.();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { detail?: string } } };
      setMessage({ text: err.response?.data?.detail || 'Failed to borrow', type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  async function handleReserve() {
    setLoading(true);
    setMessage(null);
    try {
      await reserveBook(book.id);
      setMessage({ text: 'Reserved successfully!', type: 'success' });
      onAction?.();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { detail?: string } } };
      setMessage({ text: err.response?.data?.detail || 'Failed to reserve', type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden border border-stone-200">
      <div className="h-48 bg-[#2D6A4F] flex items-center justify-center overflow-hidden">
        {book.coverUrl ? (
          <img src={book.coverUrl} alt={book.title} className="h-full w-full object-cover" />
        ) : (
          <BookOpen size={64} className="text-[#52B788] opacity-60" />
        )}
      </div>

      <div className="p-4 flex flex-col gap-2">
        <h3 className="font-serif font-semibold text-[#1B4332] text-base leading-tight line-clamp-2" title={book.title}>
          {book.title}
        </h3>
        <p className="flex items-center gap-1 text-sm text-stone-500">
          <User size={12} /> {book.author}
        </p>
        <p className="flex items-center gap-1 text-xs text-stone-400">
          <Tag size={12} /> {book.category}
        </p>

        <div className="flex items-center justify-between mt-1">
          {book.available ? (
            <span className="flex items-center gap-1 text-xs text-green-700 font-medium">
              <CheckCircle size={12} /> {book.availableCopies}/{book.totalCopies} available
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs text-red-600 font-medium">
              <XCircle size={12} /> Unavailable
            </span>
          )}
        </div>

        {message && (
          <p className={`text-xs rounded px-2 py-1 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {message.text}
          </p>
        )}

        <div className="flex gap-2 mt-2">
          <Link to={`/books/${book.id}`} className="flex-1 text-center border border-[#2D6A4F] text-[#2D6A4F] hover:bg-[#2D6A4F] hover:text-white py-1.5 rounded text-sm transition-colors">
            Details
          </Link>
          {isAuthenticated && (
            book.available ? (
              <button
                onClick={handleBorrow}
                disabled={loading}
                className="flex-1 bg-[#2D6A4F] hover:bg-[#1B4332] text-white py-1.5 rounded text-sm transition-colors disabled:opacity-60"
              >
                {loading ? '...' : 'Borrow'}
              </button>
            ) : (
              <button
                onClick={handleReserve}
                disabled={loading}
                className="flex-1 bg-amber-600 hover:bg-amber-700 text-white py-1.5 rounded text-sm transition-colors disabled:opacity-60"
              >
                {loading ? '...' : 'Reserve'}
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}
