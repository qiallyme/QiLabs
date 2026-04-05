export type Constitution = any; // tighten later with schema types

export async function loadConstitution(env: any): Promise<Constitution> {
  // v1: load from KV or bundled JSON.
  // You can switch to Supabase fetch later.
  const res = await fetch(env.CONSTITUTION_URL);
  if (!res.ok) throw new Error(`Failed to load constitution: ${res.status}`);
  return await res.json();
}

