/**
 * Server-side Base44 compatibility layer
 * Same API as base44-compat.js but uses getSupabaseServerClient()
 * for use in Server Components and generateMetadata()
 */

import { getSupabaseServerClient } from './supabase';

function createServerEntityProxy(tableName) {
  return {
    async filter(filters = {}, { limit = 100, offset = 0, order } = {}) {
      const supabase = getSupabaseServerClient();
      if (!supabase) return [];
      let query = supabase.from(tableName).select('*');

      for (const [key, value] of Object.entries(filters)) {
        if (value === undefined || value === null) continue;
        if (Array.isArray(value)) {
          query = query.in(key, value);
        } else {
          query = query.eq(key, value);
        }
      }

      if (order) {
        const desc = order.startsWith('-');
        const col = desc ? order.slice(1) : order;
        query = query.order(col, { ascending: !desc });
      }

      query = query.range(offset, offset + limit - 1);

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },

    async get(id) {
      const supabase = getSupabaseServerClient();
      if (!supabase) return null;
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
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
