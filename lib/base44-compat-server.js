/**
 * Server-side Base44 compatibility layer
 * 
 * Same API surface as base44-compat.js but uses:
 *   - getSupabaseServerClient() for READ operations (anon key, RLS-compliant)
 *   - getSupabaseAdminClient() for WRITE operations (service role, bypasses RLS)
 * 
 * Use in Server Components, generateMetadata(), and API routes.
 */

import { getSupabaseServerClient, getSupabaseAdminClient } from './supabase';

// Column aliases: Base44 → Supabase
const COLUMN_ALIASES = {
  created_date: 'created_at',
  updated_date: 'updated_at',
  published_date: 'published_at',
};

function mapColumn(col) {
  return COLUMN_ALIASES[col] || col;
}

function addAliases(row) {
  if (!row || typeof row !== 'object') return row;
  for (const [alias, real] of Object.entries(COLUMN_ALIASES)) {
    if (real in row && !(alias in row)) {
      row[alias] = row[real];
    }
  }
  return row;
}

function applyOrder(query, order) {
  if (!order) return query;
  const desc = order.startsWith('-');
  const col = mapColumn(desc ? order.slice(1) : order);
  return query.order(col, { ascending: !desc });
}

function createServerEntityProxy(tableName) {
  return {
    /**
     * List all records.
     * Supports BOTH: .list(order, limit) AND .list({ order, limit })
     */
    async list(orderOrOpts, limitArg, offsetArg) {
      let order, limit = 100, offset = 0;

      if (typeof orderOrOpts === 'string') {
        order = orderOrOpts;
        if (typeof limitArg === 'number') limit = limitArg;
        if (typeof offsetArg === 'number') offset = offsetArg;
      } else if (orderOrOpts && typeof orderOrOpts === 'object') {
        ({ order, limit = 100, offset = 0 } = orderOrOpts);
      }

      const supabase = getSupabaseServerClient();
      if (!supabase) return [];
      let query = supabase.from(tableName).select('*');
      query = applyOrder(query, order);
      query = query.range(offset, offset + limit - 1);
      const { data, error } = await query;
      if (error) throw error;
      return (data || []).map(addAliases);
    },

    /**
     * Filter records.
     * Supports BOTH: .filter(filters, order, limit) AND .filter(filters, { order, limit })
     */
    async filter(filters = {}, orderOrOpts, limitArg, offsetArg) {
      let order, limit = 100, offset = 0;

      if (typeof orderOrOpts === 'string') {
        order = orderOrOpts;
        if (typeof limitArg === 'number') limit = limitArg;
        if (typeof offsetArg === 'number') offset = offsetArg;
      } else if (orderOrOpts && typeof orderOrOpts === 'object') {
        ({ order, limit = 100, offset = 0 } = orderOrOpts);
      }

      const supabase = getSupabaseServerClient();
      if (!supabase) return [];
      let query = supabase.from(tableName).select('*');

      for (const [key, value] of Object.entries(filters)) {
        if (value === undefined || value === null) continue;
        const col = mapColumn(key);
        if (Array.isArray(value)) {
          query = query.in(col, value);
        } else {
          query = query.eq(col, value);
        }
      }

      query = applyOrder(query, order);
      query = query.range(offset, offset + limit - 1);

      const { data, error } = await query;
      if (error) throw error;
      return (data || []).map(addAliases);
    },

    /**
     * Get a single record by ID
     */
    async get(id) {
      const supabase = getSupabaseServerClient();
      if (!supabase) return null;
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return addAliases(data);
    },

    /**
     * Create a new record (uses admin client — bypasses RLS)
     */
    async create(record) {
      const supabase = getSupabaseAdminClient();
      if (!supabase) throw new Error('Supabase admin not initialized');
      const { data, error } = await supabase
        .from(tableName)
        .insert(record)
        .select()
        .single();
      if (error) throw error;
      return addAliases(data);
    },

    /**
     * Update a record by ID (uses admin client — bypasses RLS)
     */
    async update(id, updates) {
      const supabase = getSupabaseAdminClient();
      if (!supabase) throw new Error('Supabase admin not initialized');
      const { data, error } = await supabase
        .from(tableName)
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return addAliases(data);
    },

    /**
     * Delete a record by ID (uses admin client — bypasses RLS)
     */
    async delete(id) {
      const supabase = getSupabaseAdminClient();
      if (!supabase) throw new Error('Supabase admin not initialized');
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
  };
}

const TABLE_MAP = {
  Product: 'products',
  BlogPost: 'blog_posts',
  Booking: 'bookings',
  CartItem: 'cart_items',
  ContactLead: 'contact_leads',
  Order: 'orders',
  Project: 'projects',
  Quote: 'quotes',
  SavedItem: 'saved_items',
  SavedQuote: 'saved_quotes',
  User: 'users',
};

export const entities = {};
for (const [entityName, tableName] of Object.entries(TABLE_MAP)) {
  entities[entityName] = createServerEntityProxy(tableName);
}
