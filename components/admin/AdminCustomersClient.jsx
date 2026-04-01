'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { entities } from '@/lib/base44-compat';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  CheckCircle2,
  Clock,
  Heart,
  Search,
  ToggleLeft,
  ToggleRight,
  User,
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminCustomersClient() {
  const [search, setSearch] = useState('');
  const [expandedUser, setExpandedUser] = useState(null);
  const queryClient = useQueryClient();

  const { data: users = [], isLoading: loadingUsers } = useQuery({
    queryKey: ['admin-customers'],
    queryFn: () => entities.User.list('-created_date', 200),
  });

  const { data: savedItems = [] } = useQuery({
    queryKey: ['admin-saved-items'],
    queryFn: () => entities.SavedItem.list('-created_date', 500),
  });

  const toggleVerification = useMutation({
    mutationFn: ({ id, is_verified }) => entities.User.update(id, { is_verified }),
    onSuccess: (_, { full_name, is_verified }) => {
      queryClient.invalidateQueries({ queryKey: ['admin-customers'] });
      toast.success(`${full_name} ${is_verified ? 'verified' : 'unverified'}`);
    },
  });

  const getSavedItemsForUser = (userEmail) =>
    savedItems.filter((s) => s.user_email === userEmail);

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return '—';
    }
  };

  const filtered = users.filter((u) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (u.full_name || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.company_name || '').toLowerCase().includes(q) ||
      (u.phone || '').toLowerCase().includes(q)
    );
  });

  const verifiedCount = users.filter((u) => u.is_verified).length;

  if (loadingUsers) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Customer CRM</h1>
          <p className="text-slate-500 mt-1">Manage wholesale members and track lead interest</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Registered', value: users.length, color: 'text-slate-800' },
            { label: 'Verified Members', value: verifiedCount, color: 'text-green-600' },
            {
              label: 'Pending Verification',
              value: users.length - verifiedCount,
              color: 'text-amber-600',
            },
            { label: 'Products Saved', value: savedItems.length, color: 'text-red-500' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm"
            >
              <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-sm text-slate-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search by name, email, company, or phone…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">
                    Company / Phone
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">
                    Registered
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">
                    Saved
                  </th>
                  <th className="px-5 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((u) => {
                  const userSaved = getSavedItemsForUser(u.email);
                  const isExpanded = expandedUser === u.id;
                  return (
                    <React.Fragment key={u.id}>
                      <tr className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                              <span className="text-amber-700 font-bold text-sm">
                                {(u.full_name || u.email || '?')[0].toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <div className="font-semibold text-slate-800 text-sm">
                                {u.full_name || '—'}
                              </div>
                              <div className="text-xs text-slate-500">{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 hidden md:table-cell">
                          <div className="text-sm text-slate-700">{u.company_name || '—'}</div>
                          <div className="text-xs text-slate-500">{u.phone || '—'}</div>
                        </td>
                        <td className="px-5 py-4 hidden lg:table-cell text-sm text-slate-500">
                          {formatDate(u.created_date)}
                        </td>
                        <td className="px-5 py-4">
                          {u.is_verified ? (
                            <Badge className="bg-green-100 text-green-800 border-green-200 gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Verified
                            </Badge>
                          ) : (
                            <Badge className="bg-amber-100 text-amber-800 border-amber-200 gap-1">
                              <Clock className="w-3 h-3" /> Pending
                            </Badge>
                          )}
                        </td>
                        <td className="px-5 py-4 hidden sm:table-cell">
                          {userSaved.length > 0 ? (
                            <button
                              onClick={() => setExpandedUser(isExpanded ? null : u.id)}
                              className="flex items-center gap-1 text-red-400 hover:text-red-600 transition-colors text-sm font-medium"
                            >
                              <Heart className="w-4 h-4 fill-red-400" />
                              {userSaved.length} item{userSaved.length !== 1 ? 's' : ''}
                            </button>
                          ) : (
                            <span className="text-xs text-slate-300">—</span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              toggleVerification.mutate({
                                id: u.id,
                                is_verified: !u.is_verified,
                                full_name: u.full_name || u.email,
                              })
                            }
                            disabled={toggleVerification.isPending}
                            className={
                              u.is_verified
                                ? 'border-red-200 text-red-600 hover:bg-red-50'
                                : 'border-green-200 text-green-700 hover:bg-green-50'
                            }
                          >
                            {u.is_verified ? (
                              <>
                                <ToggleRight className="w-4 h-4 mr-1" /> Revoke
                              </>
                            ) : (
                              <>
                                <ToggleLeft className="w-4 h-4 mr-1" /> Approve
                              </>
                            )}
                          </Button>
                        </td>
                      </tr>
                      {isExpanded && userSaved.length > 0 && (
                        <tr className="bg-red-50">
                          <td colSpan={6} className="px-5 py-4">
                            <p className="text-xs font-semibold text-slate-600 mb-3 uppercase tracking-wide">
                              Products this customer is shopping for:
                            </p>
                            <div className="flex flex-wrap gap-3">
                              {userSaved.map((item) => (
                                <div
                                  key={item.id}
                                  className="flex items-center gap-2 bg-white border border-red-100 rounded-lg px-3 py-2 text-sm shadow-sm"
                                >
                                  {item.product_image_url && (
                                    <img
                                      src={item.product_image_url}
                                      alt={item.product_name}
                                      className="w-8 h-8 object-cover rounded"
                                    />
                                  )}
                                  <div>
                                    <div className="font-medium text-slate-800 text-xs">
                                      {item.product_name}
                                    </div>
                                    {item.product_price && (
                                      <div className="text-xs text-slate-500">
                                        C${item.product_price.toFixed(2)}/sq.ft
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-16 text-slate-400">
                <User className="w-10 h-10 mx-auto mb-3 text-slate-200" />
                <p>No customers found matching your search.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
