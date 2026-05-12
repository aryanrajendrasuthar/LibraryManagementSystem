import { useState, useEffect } from 'react';
import { BookOpen, Users, AlertTriangle, TrendingUp } from 'lucide-react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
} from 'recharts';
import { getDashboard } from '../../api/analytics';
import LoadingSpinner from '../../components/LoadingSpinner';
import type { AnalyticsDashboard } from '../../types';

const PIE_COLORS = ['#1B4332', '#2D6A4F', '#52B788', '#74C69D', '#95D5B2', '#B7E4C7', '#D8F3DC'];

export default function AdminDashboard() {
  const [data, setData] = useState<AnalyticsDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard().then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="min-h-screen bg-[#FAF7F2]"><LoadingSpinner text="Loading analytics..." /></div>;
  if (!data) return null;

  const categoryData = Object.entries(data.booksByCategory).map(([name, value]) => ({ name, value }));
  const loanData = Object.entries(data.loansPerMonth).map(([month, loans]) => ({ month, loans }));

  const stats = [
    { label: 'Total Books', value: data.totalBooks, icon: BookOpen, color: 'text-[#1B4332]', bg: 'bg-green-50' },
    { label: 'Total Members', value: data.totalMembers, icon: Users, color: 'text-blue-700', bg: 'bg-blue-50' },
    { label: 'Active Loans', value: data.activeLoans, icon: TrendingUp, color: 'text-amber-700', bg: 'bg-amber-50' },
    { label: 'Overdue Loans', value: data.overdueLoans, icon: AlertTriangle, color: 'text-red-700', bg: 'bg-red-50' },
  ];

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-[#1B4332]">Admin Dashboard</h1>
          <p className="text-stone-500 mt-1">Library analytics overview</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="bg-white rounded-xl p-5 shadow-sm border border-stone-200">
              <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center mb-3`}>
                <Icon size={20} className={color} />
              </div>
              <p className="text-2xl font-bold text-stone-800">{value}</p>
              <p className="text-sm text-stone-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Books by Category */}
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
            <h2 className="text-lg font-serif font-semibold text-[#1B4332] mb-4">Books by Category</h2>
            {categoryData.length === 0 ? (
              <p className="text-stone-400 text-sm text-center py-8">No data available</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {categoryData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => [`${v} books`, 'Count']} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Loans per Month */}
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
            <h2 className="text-lg font-serif font-semibold text-[#1B4332] mb-4">Loans per Month</h2>
            {loanData.length === 0 ? (
              <p className="text-stone-400 text-sm text-center py-8">No data available</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={loanData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="loans" fill="#2D6A4F" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Manage Books', href: '/admin/books', desc: 'Add, edit, delete books' },
            { label: 'Manage Loans', href: '/admin/loans', desc: 'View and process returns' },
            { label: 'Manage Members', href: '/admin/members', desc: 'View member accounts' },
            { label: 'All Reservations', href: '/admin/reservations', desc: 'Monitor waitlists' },
          ].map(({ label, href, desc }) => (
            <a
              key={href}
              href={href}
              className="bg-white rounded-xl p-5 shadow-sm border border-stone-200 hover:border-[#52B788] hover:shadow-md transition-all group"
            >
              <p className="font-medium text-[#1B4332] group-hover:text-[#2D6A4F] mb-1">{label}</p>
              <p className="text-xs text-stone-400">{desc}</p>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
