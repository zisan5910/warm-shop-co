import React from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useUsers } from '@/hooks/useUsers';
import { Loader2, User } from 'lucide-react';
import { format } from 'date-fns';

const AdminUsers = () => {
  const { users, loading } = useUsers();

  return (
    <AdminLayout>
      <h1 className="font-display text-2xl font-bold mb-6">Users</h1>
      {loading ? <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin" /></div> : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <table className="w-full">
            <thead className="bg-secondary"><tr><th className="px-4 py-3 text-left text-sm font-medium">User</th><th className="px-4 py-3 text-left text-sm font-medium hidden md:table-cell">Phone</th><th className="px-4 py-3 text-left text-sm font-medium hidden md:table-cell">Joined</th></tr></thead>
            <tbody>{users.map(u => (
              <tr key={u.uid} className="border-t border-border">
                <td className="px-4 py-3"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"><User className="w-5 h-5 text-primary" /></div><div><p className="font-medium">{u.name}</p><p className="text-sm text-muted-foreground">{u.email}</p></div></div></td>
                <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">{u.phone || '-'}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">{format(u.createdAt, 'MMM dd, yyyy')}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminUsers;
