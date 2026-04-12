import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export async function middleware(req: NextRequest) {
    let res = NextResponse.next({
        request: { headers: req.headers },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) { return req.cookies.get(name)?.value },
                set(name: string, value: string, options: CookieOptions) {
                    res.cookies.set({ name, value, ...options })
                },
                remove(name: string, options: CookieOptions) {
                    res.cookies.set({ name, value: '', ...options })
                },
            },
        }
    )

    // Check session securely
    const { data: { session } } = await supabase.auth.getSession()
    const tenantContext = req.cookies.get('qi_tenant_context')?.value

    // SECURITY GATE: Only apply the downstream header if they are actually an admin
    const isAdmin = session?.user?.app_metadata?.is_admin === true || session?.user?.app_metadata?.role === 'admin';

    if (tenantContext && isAdmin) {
        // Inject into headers so getActiveTenantContext() can read it
        res.headers.set('x-tenant-context', tenantContext)
    }

    return res
}

export const config = {
    // Run on all routes except Next.js internals and static files
    matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}