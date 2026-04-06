import { getSupabaseServerClient } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('session_id');

  if (!sessionId) {
    return NextResponse.json({ count: 0 });
  }

  try {
    const supabase = getSupabaseServerClient();
    const { count, error } = await supabase
      .from('cart_items')
      .select('id', { count: 'exact', head: true })
      .eq('session_id', sessionId);

    if (error) {
      return NextResponse.json({ count: 0 });
    }

    return NextResponse.json({ count: count || 0 });
  } catch {
    return NextResponse.json({ count: 0 });
  }
}
