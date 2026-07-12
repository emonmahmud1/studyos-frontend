"use client";

import React from "react";
import {
  useGetAdminUsersQuery, useUpdateUserRoleMutation, useAdminAddXpMutation,
  useAdminDeleteUserMutation, useAdminResetPasswordMutation, AdminUser,
} from "@/store/api/adminApi";
import {
  Search, Shield, ShieldOff, Trash2, Key, Star, ChevronLeft,
  ChevronRight, Users, X, Plus, RefreshCw,
} from "lucide-react";

function Badge({ role }: { role: string }) {
  return role === "ADMIN"
    ? <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-indigo-600/20 text-indigo-400 border border-indigo-600/30 uppercase tracking-wider"><Shield size={9} />Admin</span>
    : <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 uppercase tracking-wider">User</span>;
}

function UserModal({ user, onClose }: { user: AdminUser; onClose: () => void }) {
  const [updateRole] = useUpdateUserRoleMutation();
  const [addXp] = useAdminAddXpMutation();
  const [resetPassword] = useAdminResetPasswordMutation();
  const [deleteUser] = useAdminDeleteUserMutation();
  const [xpAmount, setXpAmount] = React.useState(100);
  const [resetToken, setResetToken] = React.useState<string | null>(null);

  const handleToggleRole = async () => {
    await updateRole({ id: user.id, role: user.role === "ADMIN" ? "USER" : "ADMIN" });
    onClose();
  };

  const handleAddXp = async () => {
    await addXp({ id: user.id, amount: xpAmount });
    onClose();
  };

  const handleReset = async () => {
    const res = await resetPassword(user.id).unwrap();
    setResetToken(res.token);
  };

  const handleDelete = async () => {
    if (!confirm(`Permanently delete "${user.name}" and all their data? This cannot be undone.`)) return;
    await deleteUser(user.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 flex items-center justify-center text-indigo-300 font-black text-lg">
              {user.name[0]}
            </div>
            <div>
              <p className="font-bold text-white">{user.name}</p>
              <p className="text-xs text-slate-400">{user.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer"><X size={18} /></button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 p-5 border-b border-slate-800">
          {[
            { label: "XP", value: user.xp.toLocaleString() },
            { label: "Level", value: user.level },
            { label: "Streak", value: `${user.streak} days` },
            { label: "Notes", value: user._count?.notes ?? 0 },
            { label: "Tasks", value: user._count?.tasks ?? 0 },
            { label: "Sessions", value: user._count?.sessions ?? 0 },
          ].map((s) => (
            <div key={s.label} className="bg-slate-800/60 rounded-xl p-3 text-center">
              <p className="text-xs text-slate-400">{s.label}</p>
              <p className="font-black text-white text-sm mt-0.5 font-mono">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="p-5 space-y-3">
          {/* XP Award */}
          <div className="flex gap-2">
            <input
              type="number" min={1} value={xpAmount}
              onChange={(e) => setXpAmount(Number(e.target.value))}
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
            <button onClick={handleAddXp} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors">
              <Plus size={13} />Award XP
            </button>
          </div>

          {/* Role Toggle */}
          <button onClick={handleToggleRole} className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-colors ${user.role === "ADMIN" ? "bg-slate-800 hover:bg-slate-700 text-slate-200" : "bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-600/30"}`}>
            {user.role === "ADMIN" ? <><ShieldOff size={13} />Remove Admin</> : <><Shield size={13} />Make Admin</>}
          </button>

          {/* Reset Password */}
          <button onClick={handleReset} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-amber-600/10 hover:bg-amber-600/20 text-amber-400 border border-amber-600/30 text-xs font-bold cursor-pointer transition-colors">
            <Key size={13} />Force Reset Password
          </button>

          {resetToken && (
            <div className="bg-amber-950/30 border border-amber-600/30 rounded-xl p-3">
              <p className="text-[10px] text-amber-400 font-bold mb-1">Reset Token (share with user):</p>
              <p className="text-xs font-mono text-amber-200 break-all">{resetToken}</p>
            </div>
          )}

          {/* Delete */}
          <button onClick={handleDelete} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 border border-rose-600/30 text-xs font-bold cursor-pointer transition-colors">
            <Trash2 size={13} />Delete User & All Data
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminUsersPage() {
  const [search, setSearch] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [selectedUser, setSelectedUser] = React.useState<AdminUser | null>(null);
  const [debouncedSearch, setDebouncedSearch] = React.useState("");

  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading, refetch } = useGetAdminUsersQuery({
    search: debouncedSearch || undefined,
    role: roleFilter || undefined,
    page,
    limit: 15,
  });

  return (
    <div className="space-y-5">
      {selectedUser && <UserModal user={selectedUser} onClose={() => { setSelectedUser(null); refetch(); }} />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">User Management</h1>
          <p className="text-sm text-slate-400 mt-1">
            {data ? `${data.total} total users` : "Loading..."}
          </p>
        </div>
        <button onClick={() => refetch()} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer transition-colors">
          <RefreshCw size={13} />Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text" placeholder="Search by name or email..."
            value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <select
          value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
        >
          <option value="">All Roles</option>
          <option value="USER">Users</option>
          <option value="ADMIN">Admins</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-7 h-7 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800">
                    {["User", "Role", "Level / XP", "Streak", "Content", "Joined", "Actions"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {data?.data.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-800/30 transition-colors group">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-600/20 flex items-center justify-center text-indigo-300 font-black text-xs shrink-0">
                            {user.name[0]}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-200 text-xs truncate max-w-[140px]">{user.name}</p>
                            <p className="text-[10px] text-slate-500 truncate max-w-[140px]">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3"><Badge role={user.role} /></td>
                      <td className="px-4 py-3">
                        <p className="text-xs font-bold text-slate-200">Lvl {user.level}</p>
                        <p className="text-[10px] text-slate-500 font-mono">{user.xp.toLocaleString()} XP</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-slate-300 font-mono">{user.streak}🔥</span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-[10px] text-slate-400">
                          {user._count?.notes ?? 0} notes · {user._count?.tasks ?? 0} tasks · {user._count?.sessions ?? 0} sessions
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[10px] text-slate-500">{new Date(user.createdAt).toLocaleDateString()}</span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-indigo-600/20 hover:text-indigo-400 border border-slate-700 hover:border-indigo-600/40 rounded-lg text-[11px] font-semibold text-slate-300 cursor-pointer transition-all"
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {data && data.totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800">
                <span className="text-xs text-slate-400">
                  Page {data.page} of {data.totalPages} · {data.total} users
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 disabled:opacity-30 cursor-pointer transition-colors"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))} disabled={page === data.totalPages}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 disabled:opacity-30 cursor-pointer transition-colors"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}

            {data?.data.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-slate-500">
                <Users size={32} className="mb-3 opacity-40" />
                <p className="text-sm font-semibold">No users found</p>
                <p className="text-xs mt-1">Try adjusting your search or filter</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
