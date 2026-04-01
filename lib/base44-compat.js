/**
 * Base44 SDK Compatibility Layer
 * 
 * Provides the same API surface as base44.entities.X so ported components
 * need minimal changes. Under the hood, talks to Supabase directly.
 * 
 * Usage in ported components:
 *   // OLD: import { base44 } from '@/api/base44Client';
 *   //      base44.entities.Product.filter({ category: 'vinyl' })
 *   
 *   // NEW: import { entities } from '@/lib/base44-compat';
 *   //      entities.Product.filter({ category: 'vinyl' })
 */

import { getSupabaseBrowserClient } from './supabase';

// Base44 used `created_date` / `updated_date`; Supabase uses `created_at` / `updated_at`.
// Map them transparently so all ported components keep working.
const COLUMN_ALIASES = {
  created_date: 'created_at',
  updated_date: 'updated_at',
  published_date: 'published_at',
};

function mapColumn(col) {
  return COLUMN_ALIASES[col] || col;
}

// When Supabase returns `created_at`, also expose it as `created_date` for compat.
function addAliases(row) {
  if (!row || typeof row !== 'object') return row;
  for (const [alias, real] of Object.entries(COLUMN_ALIASES)) {
    if (real in row && !(alias in row)) {
      row[alias] = row[real];
    }
  }
  return row;
}

function createEntityProxy(tableName) {
  return {
    /**
     * List all records.
     * Supports BOTH calling conventions:
     *   Base44 style:  .list(order, limit)        — positional args
     *   Compat style:  .list({ order, limit })    — named args object
     */
    async list(orderOrOpts, limitArg, offsetArg) {
      let order, limit = 100, offset = 0;

      if (typeof orderOrOpts === 'string') {
        // Base44 positional: .list('-created_date', 500)
        order = orderOrOpts;
        if (typeof limitArg === 'number') limit = limitArg;
        if (typeof offsetArg === 'number') offset = offsetArg;
      } else if (orderOrOpts && typeof orderOrOpts === 'object') {
        // Named args: .list({ order, limit, offset })
        ({ order, limit = 100, offset = 0 } = orderOrOpts);
      }

      const supabase = getSupabaseBrowserClient();
      if (!supabase) return [];
      let query = supabase
        .from(tableName)
        .select('*');
      if (order) {
        const desc = order.startsWith('-');
        const col = mapColumn(desc ? order.slice(1) : order);
        query = query.order(col, { ascending: !desc });
      }
      query = query.range(offset, offset + limit - 1);
      const { data, error } = await query;
      if (error) throw error;
      return (data || []).map(addAliases);
    },

    /**
     * Filter records by field values.
     * Supports BOTH calling conventions:
     *   Base44 style:  .filter(filters, order, limit)    — positional args
     *   Compat style:  .filter(filters, { order, limit }) — named args object
     * 
     * Filter values: { field: value } for exact match, { field: [v1,v2] } for IN
     */
    async filter(filters = {}, orderOrOpts, limitArg, offsetArg) {
      let order, limit = 100, offset = 0;

      if (typeof orderOrOpts === 'string') {
        // Base44 positional: .filter(filters, '-created_date', 50)
        order = orderOrOpts;
        if (typeof limitArg === 'number') limit = limitArg;
        if (typeof offsetArg === 'number') offset = offsetArg;
      } else if (orderOrOpts && typeof orderOrOpts === 'object') {
        // Named args: .filter(filters, { order, limit, offset })
        ({ order, limit = 100, offset = 0 } = orderOrOpts);
      }

      const supabase = getSupabaseBrowserClient();
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

      if (order) {
        const desc = order.startsWith('-');
        const col = mapColumn(desc ? order.slice(1) : order);
        query = query.order(col, { ascending: !desc });
      }

      query = query.range(offset, offset + limit - 1);

      const { data, error } = await query;
      if (error) throw error;
      return (data || []).map(addAliases);
    },

    /**
     * Get a single record by ID
     */
    async get(id) {
      const supabase = getSupabaseBrowserClient();
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
     * Create a new record
     */
    async create(record) {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) throw new Error('Supabase not initialized');
      const { data, error } = await supabase
        .from(tableName)
        .insert(record)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    /**
     * Update a record by ID
     */
    async update(id, updates) {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) throw new Error('Supabase not initialized');
      const { data, error } = await supabase
        .from(tableName)
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    /**
     * Delete a record by ID
     */
    async delete(id) {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) throw new Error('Supabase not initialized');
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
  };
}

// Map Base44 entity names to Supabase table names
// Base44 uses PascalCase entity names; Supabase uses the actual table names
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

// Create entity proxies for all known entities
export const entities = {};
for (const [entityName, tableName] of Object.entries(TABLE_MAP)) {
  entities[entityName] = createEntityProxy(tableName);
}

// Default export mimics `base44` object structure
const base44Compat = { entities };
export default base44Compat;
