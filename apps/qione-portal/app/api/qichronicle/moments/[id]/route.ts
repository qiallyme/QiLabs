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

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const rawBody = await request.json();
  const payload = sanitizePayload(rawBody);

  const { data, error } = await supabase
    .from('moments')
    .update(payload)
    .eq('id', id)
    .eq('user_id', user.id) // Enforce ownership explicitly
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
