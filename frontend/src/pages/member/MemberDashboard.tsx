import { useState, useEffect } from 'react';
import { BookOpen, Clock, AlertTriangle, CheckCircle, XCircle, BookMarked } from 'lucide-react';
import { getMyLoans } from '../../api/loans';
import { getMyReservations, cancelReservation } from '../../api/reservations';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import type { Loan, Reservation } from '../../types';

function daysUntil(dateStr: string): number {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
}

function daysOverdue(dateStr: string): number {
  return Math.ceil((Date.now() - new Date(dateStr).getTime()) / 86400000);
}

export default function MemberDashboard() {
  const { user } = useAuth();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  async function fetchData() {
    try {
      const [lPage, r] = await Promise.all([getMyLoans(0, 100), getMyReservations()]);
      setLoans(lPage.content);
      setReservations(r);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchData(); }, []);

  async function handleCancel(id: number) {
    setCancellingId(id);
    try {
      await cancelReservation(id);
      await fetchData();
    } finally {
      setCancellingId(null);
    }
  }

  const activeLoans = loans.filter((l) => l.status === 'ACTIVE' || l.status === 'OVERDUE');
  const returnedLoans = loans.filter((l) => l.status === 'RETURNED');
  const pendingReservations = reservations.filter((r) => r.status === 'PENDING');
  const totalFines = activeLoans.reduce((sum, l) => sum + (l.fineAmount || 0), 0);

  if (loading) return <div className="min-h-screen bg-[#FAF7F2]"><LoadingSpinner text="Loading dashboard..." /></div>;

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-[#1B4332]">My Dashboard</h1>
          <p className="text-stone-500 mt-1">Welcome back, {user?.name}</p>
          <p className="text-xs text-stone-400 mt-0.5">Member ID: {user?.membershipId}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-stone-200">
            <p className="text-sm text-stone-500 mb-1">Active Loans</p>
            <p className="text-2xl font-bold text-[#1B4332]">{activeLoans.length}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-stone-200">
            <p className="text-sm text-stone-500 mb-1">Reservations</p>
            <p className="text-2xl font-bold text-amber-600">{pendingReservations.length}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-stone-200">
            <p className="text-sm text-stone-500 mb-1">Returned</p>
            <p className="text-2xl font-bold text-stone-600">{returnedLoans.length}</p>
          </div>
          <div className={`rounded-xl p-4 shadow-sm border ${totalFines > 0 ? 'bg-red-50 border-red-200' : 'bg-white border-stone-200'}`}>
            <p className="text-sm text-stone-500 mb-1">Fines Owed</p>
            <p className={`text-2xl font-bold ${totalFines > 0 ? 'text-red-600' : 'text-stone-600'}`}>
              ${totalFines.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Active Loans */}
        <section className="mb-8">
          <h2 className="text-xl font-serif font-semibold text-[#1B4332] mb-4 flex items-center gap-2">
            <BookOpen size={20} /> Active Loans
          </h2>
          {activeLoans.length === 0 ? (
            <div className="bg-white rounded-xl p-6 text-center text-stone-400 border border-stone-200">
              No active loans. <a href="/catalog" className="text-[#2D6A4F] hover:underline">Browse the catalog</a>
            </div>
          ) : (
            <div className="space-y-3">
              {activeLoans.map((loan) => {
                const overdue = loan.status === 'OVERDUE';
                const days = overdue ? daysOverdue(loan.dueDate) : daysUntil(loan.dueDate);
                return (
                  <div key={loan.id} className={`bg-white rounded-xl p-4 shadow-sm border flex items-center gap-4 ${overdue ? 'border-red-200' : 'border-stone-200'}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${overdue ? 'bg-red-100' : 'bg-green-100'}`}>
                      {overdue ? <AlertTriangle size={18} className="text-red-600" /> : <Clock size={18} className="text-green-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[#1B4332] truncate">{loan.bookTitle}</p>
                      <p className="text-sm text-stone-400">{loan.bookAuthor}</p>
                    </div>
                    <div className="text-right shrink-0">
                      {overdue ? (
                        <>
                          <p className="text-red-600 font-semibold text-sm">{days} day{days !== 1 ? 's' : ''} overdue</p>
                          <p className="text-red-500 text-xs">Fine: ${(loan.fineAmount || 0).toFixed(2)}</p>
                        </>
                      ) : (
                        <>
                          <p className={`font-semibold text-sm ${days <= 3 ? 'text-amber-600' : 'text-green-600'}`}>
                            {days === 0 ? 'Due today' : `${days} day${days !== 1 ? 's' : ''} left`}
                          </p>
                          <p className="text-stone-400 text-xs">Due {new Date(loan.dueDate).toLocaleDateString()}</p>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Reservations */}
        <section className="mb-8">
          <h2 className="text-xl font-serif font-semibold text-[#1B4332] mb-4 flex items-center gap-2">
            <BookMarked size={20} /> Reservations
          </h2>
          {pendingReservations.length === 0 ? (
            <div className="bg-white rounded-xl p-6 text-center text-stone-400 border border-stone-200">
              No pending reservations.
            </div>
          ) : (
            <div className="space-y-3">
              {pendingReservations.map((res) => (
                <div key={res.id} className="bg-white rounded-xl p-4 shadow-sm border border-amber-200 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                    <BookMarked size={18} className="text-amber-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[#1B4332] truncate">{res.bookTitle}</p>
                    <p className="text-sm text-stone-400">{res.bookAuthor}</p>
                    <p className="text-xs text-stone-400 mt-0.5">Reserved {new Date(res.reservedAt).toLocaleDateString()}</p>
                  </div>
                  <button
                    onClick={() => handleCancel(res.id)}
                    disabled={cancellingId === res.id}
                    className="text-xs text-red-500 hover:text-red-700 border border-red-200 hover:border-red-400 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {cancellingId === res.id ? '...' : 'Cancel'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Loan History */}
        {returnedLoans.length > 0 && (
          <section>
            <h2 className="text-xl font-serif font-semibold text-[#1B4332] mb-4 flex items-center gap-2">
              <CheckCircle size={20} /> Loan History
            </h2>
            <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-stone-50 border-b border-stone-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-stone-600 font-medium">Book</th>
                    <th className="text-left px-4 py-3 text-stone-600 font-medium hidden md:table-cell">Borrowed</th>
                    <th className="text-left px-4 py-3 text-stone-600 font-medium">Returned</th>
                    <th className="text-right px-4 py-3 text-stone-600 font-medium">Fine</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {returnedLoans.map((loan) => (
                    <tr key={loan.id} className="hover:bg-stone-50">
                      <td className="px-4 py-3">
                        <p className="font-medium text-[#1B4332]">{loan.bookTitle}</p>
                        <p className="text-stone-400 text-xs">{loan.bookAuthor}</p>
                      </td>
                      <td className="px-4 py-3 text-stone-500 hidden md:table-cell">
                        {new Date(loan.borrowedAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-stone-500">
                        {loan.returnedAt ? new Date(loan.returnedAt).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {loan.fineAmount && loan.fineAmount > 0 ? (
                          <span className="text-red-600">${loan.fineAmount.toFixed(2)}</span>
                        ) : (
                          <span className="text-green-600 flex items-center justify-end gap-1">
                            <XCircle size={12} /> None
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
