import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

const sanitizePayload = (body: any) => ({
  entry_type: body.entry_type,
  title: body.title,
  body: body.body ?? null,
  occurred_at: body.occurred_at,
  planned_for: body.planned_for ?? null,
  is_active: !!body.is_active,
  state: body.state,
  needs_review: !!body.needs_review,
  meta_std: body.meta_std ?? {},
  meta_ext: {
    tags: Array.isArray(body?.meta_ext?.tags) ? body.meta_ext.tags : [],
    contexts: Array.isArray(body?.meta_ext?.contexts) ? body.meta_ext.contexts : [],
  },
});

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);

  let query = supabase
    .from('moments')
    .select('*')
    .eq('user_id', user.id)
    .order('occurred_at', { ascending: false });

  const s = searchParams.get('search');
  if (s) {
    const cleanSearch = s.replace(/[%,"']/g, '').trim();
    if (cleanSearch) {
      query = query.or(`title.ilike.%${cleanSearch}%,body.ilike.%${cleanSearch}%`);
    }
  }

  if (searchParams.get('types')) {
    query = query.in('entry_type', searchParams.get('types')!.split(','));
  }
  if (searchParams.get('state')) {
    query = query.eq('state', searchParams.get('state'));
  }
  if (searchParams.get('isActiveOnly') === 'true') {
    query = query.eq('is_active', true);
  }
  if (searchParams.get('needsReviewOnly') === 'true') {
    query = query.eq('needs_review', true);
  }
  if (searchParams.get('dateFrom')) {
    query = query.gte('occurred_at', searchParams.get('dateFrom'));
  }
  if (searchParams.get('dateTo')) {
    query = query.lte('occurred_at', searchParams.get('dateTo'));
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const rawBody = await request.json();
  const payload = sanitizePayload(rawBody);

  // Force server-side auth ID
  (payload as any).user_id = user.id;

  const { data, error } = await supabase
    .from('moments')
    .insert([payload])
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
