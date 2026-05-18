export interface Env {
  DB: D1Database;
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': 'https://access.qially.com',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
};

/**
 * Standardized JSON response helper
 */
const respond = (data: any, status = 200) => {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...CORS_HEADERS,
      'Content-Type': 'application/json',
    },
  });
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { pathname } = new URL(request.url);
    const method = request.method;

    // Handle CORS preflight
    if (method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    try {
      // GET /health - Simple health check
      if (method === 'GET' && pathname === '/health') {
        return respond({ status: 'ok', timestamp: new Date().toISOString() });
      }

      // GET /bookmarks - List all bookmarks
      if (method === 'GET' && pathname === '/bookmarks') {
        const { results } = await env.DB.prepare(
          'SELECT * FROM bookmarks ORDER BY pinned DESC, created_at DESC'
        ).all();
        
        // Parse tags back to JSON for response
        const bookmarks = results.map(row => ({
          ...row,
          tags: typeof row.tags === 'string' ? JSON.parse(row.tags) : []
        }));
        
        return respond(bookmarks);
      }

      // POST /bookmarks - Create a new bookmark
      if (method === 'POST' && pathname === '/bookmarks') {
        const body: any = await request.json();
        
        // Validation: title and url are required
        if (!body.title || !body.url) {
          return respond({ error: 'Missing required fields: title, url' }, 400);
        }

        const id = crypto.randomUUID();
        const now = new Date().toISOString();
        
        // Tags stored as JSON string
        const tags = Array.isArray(body.tags) ? JSON.stringify(body.tags) : '[]';

        await env.DB.prepare(
          `INSERT INTO bookmarks (
            id, title, url, description, category, tags, scope, pinned, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(
          id,
          body.title,
          body.url,
          body.description || '',
          body.category || '',
          tags,
          body.scope || 'cloud',
          body.pinned ? 1 : 0,
          now,
          now
        ).run();

        return respond({ id, created_at: now }, 201);
      }

      // Path-based routing for /bookmarks/:id
      const match = pathname.match(/^\/bookmarks\/([^\/]+)$/);
      if (match) {
        const id = match[1];

        // PATCH /bookmarks/:id - Update specific fields
        if (method === 'PATCH') {
          const body: any = await request.json();
          const allowedFields = ['title', 'url', 'description', 'category', 'tags', 'scope', 'pinned'];
          const updates: string[] = [];
          const values: any[] = [];

          for (const field of allowedFields) {
            if (body[field] !== undefined) {
              updates.push(`${field} = ?`);
              let val = body[field];
              if (field === 'tags' && Array.isArray(val)) val = JSON.stringify(val);
              if (field === 'pinned') val = val ? 1 : 0;
              values.push(val);
            }
          }

          if (updates.length === 0) {
            return respond({ error: 'No valid fields provided for update' }, 400);
          }

          const now = new Date().toISOString();
          updates.push('updated_at = ?');
          values.push(now);
          values.push(id);

          const { meta } = await env.DB.prepare(
            `UPDATE bookmarks SET ${updates.join(', ')} WHERE id = ?`
          ).bind(...values).run();

          if (meta.changes === 0) {
            return respond({ error: 'Bookmark not found' }, 404);
          }

          return respond({ ok: true, updated_at: now });
        }

        // DELETE /bookmarks/:id - Remove a bookmark
        if (method === 'DELETE') {
          const { meta } = await env.DB.prepare(
            'DELETE FROM bookmarks WHERE id = ?'
          ).bind(id).run();

          if (meta.changes === 0) {
            return respond({ error: 'Bookmark not found' }, 404);
          }

          return respond({ ok: true });
        }
      }

      return respond({ error: 'Route not found' }, 404);
    } catch (err: any) {
      console.error('Error handling request:', err);
      return respond({ error: err.message || 'Internal Server Error' }, 500);
    }
  },
};
