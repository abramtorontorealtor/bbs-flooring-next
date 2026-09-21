'use client';

// CustomerGroupCard.jsx — header UI for a grouped CRM customer (2+ source
// records sharing an email/phone — see crmGrouping.js). Renders the
// summary header only; per-record rows/cards render as `children`
// (mobile) or as sibling <TableRow>s under a header row (desktop).
// CustomerTimeline stays in the lead detail dialog — one fetch per opened
// lead, not one per group on every list render.

import { Badge } from "@/components/ui/badge";
import { Users, Phone, Mail } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function CustomerGroupHeader({ group }) {
  if (!group) return null;
  return (
    <div className="space-y-2">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 min-w-0">
          <Users className="w-4 h-4 text-amber-600 shrink-0" />
          <div className="min-w-0">
            <p className="font-bold text-slate-800 truncate">{group.name}</p>
            <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
              {group.phone && (
                <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {group.phone}</span>
              )}
              {group.email && (
                <span className="flex items-center gap-1 truncate"><Mail className="w-3 h-3" /> {group.email}</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {group.totalValue > 0 && (
            <span className="font-bold text-amber-700 text-sm">${group.totalValue.toLocaleString('en-CA')}</span>
          )}
          <Badge className="bg-amber-200 text-amber-900 text-xs border border-amber-300 whitespace-nowrap">
            {group.count} submissions
          </Badge>
          {group.mostRecentDate && (
            <span className="text-xs text-slate-400 whitespace-nowrap">
              {formatDistanceToNow(new Date(group.mostRecentDate), { addSuffix: true })}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// Card wrapper for mobile: header + the caller's existing per-record cards
// nested underneath.
export default function CustomerGroupCard({ group, children }) {
  return (
    <div className="rounded-xl border-2 border-amber-200 bg-amber-50/40 p-3 mb-3">
      <CustomerGroupHeader group={group} />
      <div className="space-y-2 mt-2">{children}</div>
    </div>
  );
}
