import { useState, useEffect, useCallback } from 'react';
import { Search, UserCheck, UserX, Shield } from 'lucide-react';
import { getMembers, updateRole, toggleActive } from '../../api/members';
import LoadingSpinner from '../../components/LoadingSpinner';
import type { Member, Page } from '../../types';

export default function MemberManagement() {
  const [members, setMembers] = useState<Page<Member> | null>(null);
  const [query, setQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<number | null>(null);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMembers({ query, page, size: 15 });
      setMembers(data);
    } finally {
      setLoading(false);
    }
  }, [query, page]);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  async function handleRoleChange(id: number, role: 'ADMIN' | 'LIBRARIAN' | 'MEMBER') {
    setActionId(id);
    try {
      await updateRole(id, role);
      fetchMembers();
    } finally {
      setActionId(null);
    }
  }

  async function handleToggleActive(id: number) {
    setActionId(id);
    try {
      await toggleActive(id);
      fetchMembers();
    } finally {
      setActionId(null);
    }
  }

  const roleBadge = (role: string) => {
    const map: Record<string, string> = {
      ADMIN: 'bg-purple-100 text-purple-700',
      LIBRARIAN: 'bg-blue-100 text-blue-700',
      MEMBER: 'bg-stone-100 text-stone-600',
    };
    return `text-xs font-medium px-2 py-0.5 rounded-full ${map[role] || ''}`;
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-[#1B4332]">Member Management</h1>
          <p className="text-stone-500 mt-1">Manage library member accounts and roles</p>
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
              placeholder="Search by name, email, or membership ID..."
              className="w-full pl-9 pr-4 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#52B788]"
            />
          </div>
          <button type="submit" className="bg-[#2D6A4F] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#1B4332] transition-colors">
            Search
          </button>
        </form>

        {loading ? (
          <LoadingSpinner text="Loading members..." />
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-stone-50 border-b border-stone-200">
                <tr>
                  <th className="text-left px-4 py-3 text-stone-600 font-medium">Member</th>
                  <th className="text-left px-4 py-3 text-stone-600 font-medium hidden md:table-cell">Membership ID</th>
                  <th className="text-center px-4 py-3 text-stone-600 font-medium">Role</th>
                  <th className="text-center px-4 py-3 text-stone-600 font-medium">Status</th>
                  <th className="text-center px-4 py-3 text-stone-600 font-medium hidden lg:table-cell">Borrow Limit</th>
                  <th className="text-right px-4 py-3 text-stone-600 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {members?.content.map((member) => (
                  <tr key={member.id} className="hover:bg-stone-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-[#1B4332]">{member.name}</p>
                      <p className="text-xs text-stone-400">{member.email}</p>
                    </td>
                    <td className="px-4 py-3 text-stone-500 text-xs hidden md:table-cell">{member.membershipId}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={roleBadge(member.role)}>{member.role}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${member.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                        {member.active ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-stone-500 hidden lg:table-cell">{member.borrowingLimit}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Role change */}
                        <select
                          value={member.role}
                          onChange={(e) => handleRoleChange(member.id, e.target.value as 'ADMIN' | 'LIBRARIAN' | 'MEMBER')}
                          disabled={actionId === member.id}
                          className="text-xs border border-stone-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#52B788] disabled:opacity-50"
                        >
                          <option value="MEMBER">MEMBER</option>
                          <option value="LIBRARIAN">LIBRARIAN</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>

                        {/* Toggle active */}
                        <button
                          onClick={() => handleToggleActive(member.id)}
                          disabled={actionId === member.id}
                          title={member.active ? 'Suspend member' : 'Activate member'}
                          className={`p-1 rounded transition-colors disabled:opacity-50 ${member.active ? 'text-stone-400 hover:text-red-600' : 'text-stone-400 hover:text-green-600'}`}
                        >
                          {member.active ? (
                            <UserX size={16} className="flex items-center" />
                          ) : (
                            <UserCheck size={16} />
                          )}
                        </button>

                        {member.role !== 'ADMIN' && (
                          <button
                            onClick={() => handleRoleChange(member.id, 'LIBRARIAN')}
                            disabled={actionId === member.id || member.role === 'LIBRARIAN'}
                            title="Promote to Librarian"
                            className="p-1 text-stone-400 hover:text-blue-600 transition-colors disabled:opacity-30"
                          >
                            <Shield size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {members?.content.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-stone-400">No members found</td>
                  </tr>
                )}
              </tbody>
            </table>

            {members && members.totalPages > 1 && (
              <div className="flex justify-between items-center px-4 py-3 border-t border-stone-200">
                <p className="text-xs text-stone-400">{members.totalElements} members total</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => p - 1)}
                    disabled={members.number === 0}
                    className="px-3 py-1 border border-stone-300 rounded text-xs disabled:opacity-40 hover:bg-stone-50"
                  >
                    Prev
                  </button>
                  <span className="px-3 py-1 text-xs text-stone-500">{members.number + 1} / {members.totalPages}</span>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={members.number === members.totalPages - 1}
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
    </div>
  );
}
