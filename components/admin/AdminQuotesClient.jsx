'use client';

import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { entities } from '@/lib/base44-compat';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Mail, Phone, Calendar, DollarSign, Package, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminQuotesClient() {
  const queryClient = useQueryClient();

  const { data: quotes = [], isLoading, refetch } = useQuery({
    queryKey: ['admin-quotes'],
    queryFn: () => entities.Quote.list('-created_date', 1000),
    initialData: [],
  });

  const deleteQuote = async (id) => {
    if (!confirm('Are you sure you want to delete this quote?')) return;
    try {
      await entities.Quote.delete(id);
      toast.success('Quote deleted');
      refetch();
    } catch (error) {
      toast.error('Failed to delete quote');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center">Loading quotes...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Quote Leads</h1>
        <p className="text-slate-600 mt-2">All customer quote requests</p>
      </div>

      <div className="grid gap-6">
        {quotes.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-slate-500">
              No quotes submitted yet
            </CardContent>
          </Card>
        ) : (
          quotes.map((quote) => (
            <Card key={quote.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">
                      {quote.customer_name || 'Anonymous'}
                    </CardTitle>
                    <div className="flex gap-4 mt-2 text-sm text-slate-600">
                      {quote.customer_email && (
                        <div className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          <a
                            href={`mailto:${quote.customer_email}`}
                            className="hover:text-amber-600"
                          >
                            {quote.customer_email}
                          </a>
                        </div>
                      )}
                      {quote.customer_phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          <a
                            href={`tel:${quote.customer_phone}`}
                            className="hover:text-amber-600"
                          >
                            {quote.customer_phone}
                          </a>
                        </div>
                      )}
                    </div>
                    {(quote.customer_address || quote.preferred_date || quote.preferred_time || quote.is_member) && (
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-slate-600">
                        {quote.customer_address && <span>📍 {quote.customer_address}</span>}
                        {(quote.preferred_date || quote.preferred_time) && <span>📅 {quote.preferred_date ? new Date(quote.preferred_date + 'T00:00:00').toLocaleDateString() : ''} {quote.preferred_time || ''}</span>}
                        {quote.is_member && <span className="text-amber-600 font-medium">⭐ Member</span>}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-amber-100 text-amber-800 border-0">
                      {quote.status || 'draft'}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteQuote(quote.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Project Details */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      Project Details
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-slate-500">Product:</span>
                        <p className="font-medium">{quote.product_name || 'N/A'}</p>
                      </div>
                      {quote.square_footage > 0 && (
                        <div>
                          <span className="text-slate-500">Square Footage:</span>
                          <p className="font-medium">{quote.square_footage} sq.ft</p>
                        </div>
                      )}
                      {quote.removal_type && quote.removal_type !== 'none' && (
                        <div>
                          <span className="text-slate-500">Removal:</span>
                          <p className="font-medium capitalize">
                            {quote.removal_type.replace('_', ' ')}
                          </p>
                        </div>
                      )}
                      <div className="flex gap-4">
                        {quote.needs_baseboards && (
                          <Badge variant="outline" className="text-xs">
                            Baseboards
                          </Badge>
                        )}
                        {quote.needs_shoe_moulding && (
                          <Badge variant="outline" className="text-xs">
                            Shoe Moulding
                          </Badge>
                        )}
                      </div>
                      {(quote.stair_tread_count > 0 || quote.stair_pie_count > 0 || quote.stair_posts > 0 || quote.stair_pickets > 0 || quote.stair_nosing?.lf > 0 || quote.stair_railing?.lf > 0 || quote.stair_stringers?.count > 0 || quote.stair_landing) && (
                        <div className="pt-2 border-t">
                          <span className="text-slate-500">🪜 Stair Configuration:</span>
                          <ul className="mt-1 ml-1 space-y-0.5 text-xs text-slate-700">
                            {quote.stair_tread_count > 0 && <li>{quote.stair_tread_count} straight treads ({quote.stair_refinish ? 'refinish' : 'new'})</li>}
                            {quote.stair_pie_count > 0 && <li>{quote.stair_pie_count} pie/triangle treads</li>}
                            {quote.stair_posts > 0 && <li>{quote.stair_posts} post(s)</li>}
                            {quote.stair_pickets > 0 && <li>{quote.stair_pickets} pickets</li>}
                            {quote.stair_stringers?.count > 0 && <li>{quote.stair_stringers.count} stringer(s) — {quote.stair_stringers.type}</li>}
                            {quote.stair_nosing?.lf > 0 && <li>Nosing {quote.stair_nosing.lf} lf ({quote.stair_nosing.type})</li>}
                            {quote.stair_railing?.lf > 0 && <li>Railing {quote.stair_railing.lf} lf ({quote.stair_railing.type})</li>}
                            {quote.stair_landing && <li>Landing: {quote.stair_landing.size}</li>}
                            {quote.stair_species && quote.stair_species !== 'red_oak' && <li>Species: {String(quote.stair_species).replace('_', ' ')}</li>}
                          </ul>
                        </div>
                      )}
                      {quote.notes && (
                        <div className="pt-2 border-t">
                          <span className="text-slate-500">Customer Notes:</span>
                          <p className="mt-1 text-xs whitespace-pre-wrap bg-amber-50 border border-amber-200 rounded p-2">{quote.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Cost Breakdown */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      Quote Breakdown
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Flooring:</span>
                        <span className="font-medium">C${quote.flooring_cost?.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Installation:</span>
                        <span className="font-medium">
                          C${quote.installation_cost?.toFixed(2)}
                        </span>
                      </div>
                      {quote.removal_cost > 0 && (
                        <div className="flex justify-between">
                          <span className="text-slate-500">Removal:</span>
                          <span className="font-medium">C${quote.removal_cost?.toFixed(2)}</span>
                        </div>
                      )}
                      {quote.baseboard_cost > 0 && (
                        <div className="flex justify-between">
                          <span className="text-slate-500">Baseboards:</span>
                          <span className="font-medium">
                            C${quote.baseboard_cost?.toFixed(2)}
                          </span>
                        </div>
                      )}
                      {quote.shoe_moulding_cost > 0 && (
                        <div className="flex justify-between">
                          <span className="text-slate-500">Shoe Moulding:</span>
                          <span className="font-medium">
                            C${quote.shoe_moulding_cost?.toFixed(2)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-slate-500">Delivery:</span>
                        <span className="font-medium">C${quote.delivery_cost?.toFixed(2)}</span>
                      </div>
                      <div className="border-t pt-2 flex justify-between font-semibold text-base">
                        <span className="text-slate-700">Total:</span>
                        <span className="text-amber-600">C${quote.total?.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t flex items-center gap-2 text-xs text-slate-500">
                  <Calendar className="w-3 h-3" />
                  <span>Submitted: {new Date(quote.created_date).toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
