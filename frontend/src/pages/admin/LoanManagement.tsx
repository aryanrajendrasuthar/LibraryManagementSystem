import { useState, useEffect, useCallback } from 'react';
import { Search, RefreshCw, AlertTriangle } from 'lucide-react';
import { getAllLoans, adminReturnBook } from '../../api/loans';
import LoadingSpinner from '../../components/LoadingSpinner';
import type { Loan } from '../../types';

export default function LoanManagement() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [filtered, setFiltered] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [returningId, setReturningId] = useState<number | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fetchLoans = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllLoans(0, 1000);
      setLoans(data.content);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLoans(); }, [fetchLoans]);

  useEffect(() => {
    let result = loans;
    if (statusFilter) result = result.filter((l) => l.status === statusFilter);
    if (query) {
      const q = query.toLowerCase();
      result = result.filter(
        (l) => l.bookTitle.toLowerCase().includes(q) || l.memberName.toLowerCase().includes(q) || l.memberEmail.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [loans, query, statusFilter]);

  async function handleReturn(id: number) {
    setReturningId(id);
    setMessage(null);
    try {
      await adminReturnBook(id);
      setMessage({ text: 'Book returned successfully', type: 'success' });
      fetchLoans();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } } };
      setMessage({ text: e.response?.data?.detail || 'Return failed', type: 'error' });
    } finally {
      setReturningId(null);
    }
  }

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      ACTIVE: 'bg-green-100 text-green-700',
      OVERDUE: 'bg-red-100 text-red-700',
      RETURNED: 'bg-stone-100 text-stone-600',
    };
    return `text-xs font-medium px-2 py-0.5 rounded-full ${map[status] || 'bg-stone-100 text-stone-500'}`;
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-[#1B4332]">Loan Management</h1>
          <p className="text-stone-500 mt-1">Track and manage all book loans</p>
        </div>

        {message && (
          <div className={`mb-4 p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {message.text}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-4 mb-6 flex flex-wrap gap-3">
          <div className="flex-1 min-w-48 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by book or member..."
              className="w-full pl-9 pr-4 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#52B788]"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#52B788]"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="OVERDUE">Overdue</option>
            <option value="RETURNED">Returned</option>
          </select>
          <button
            onClick={fetchLoans}
            className="flex items-center gap-1 text-sm text-stone-500 hover:text-[#2D6A4F] border border-stone-300 px-3 py-2 rounded-lg hover:border-[#52B788] transition-colors"
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {loading ? (
          <LoadingSpinner text="Loading loans..." />
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-stone-50 border-b border-stone-200">
                <tr>
                  <th className="text-left px-4 py-3 text-stone-600 font-medium">Book</th>
                  <th className="text-left px-4 py-3 text-stone-600 font-medium hidden md:table-cell">Member</th>
                  <th className="text-left px-4 py-3 text-stone-600 font-medium hidden lg:table-cell">Due Date</th>
                  <th className="text-center px-4 py-3 text-stone-600 font-medium">Status</th>
                  <th className="text-right px-4 py-3 text-stone-600 font-medium">Fine</th>
                  <th className="text-right px-4 py-3 text-stone-600 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filtered.map((loan) => (
                  <tr key={loan.id} className={`hover:bg-stone-50 ${loan.status === 'OVERDUE' ? 'bg-red-50/30' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {loan.status === 'OVERDUE' && <AlertTriangle size={14} className="text-red-500 shrink-0" />}
                        <div>
                          <p className="font-medium text-[#1B4332]">{loan.bookTitle}</p>
                          <p className="text-xs text-stone-400">{loan.bookIsbn}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <p className="text-stone-700">{loan.memberName}</p>
                      <p className="text-xs text-stone-400">{loan.memberEmail}</p>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-stone-500">
                      {new Date(loan.dueDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={statusBadge(loan.status)}>{loan.status}</span>
                    </td>
                    <td className="px-4 py-3 text-right text-stone-600">
                      {loan.fineAmount > 0 ? <span className="text-red-600">${loan.fineAmount.toFixed(2)}</span> : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {loan.status !== 'RETURNED' && (
                        <button
                          onClick={() => handleReturn(loan.id)}
                          disabled={returningId === loan.id}
                          className="text-xs bg-[#2D6A4F] hover:bg-[#1B4332] text-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {returningId === loan.id ? '...' : 'Return'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-stone-400">No loans found</td>
                  </tr>
                )}
              </tbody>
            </table>
            <div className="px-4 py-3 border-t border-stone-200">
              <p className="text-xs text-stone-400">{filtered.length} loan{filtered.length !== 1 ? 's' : ''} shown</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
