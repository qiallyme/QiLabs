/**
 * QiCockpit Worker - Gina's Brain
 * 
 * This Cloudflare Worker runs Gina (your AI assistant) and connects to:
 * - Supabase (Unified Brain / QiNodes)
 * - OpenAI (Embeddings & AI)
 * - Zoho MCP (CRM, Projects, Desk, etc.)
 */

import { getSupabase } from './supabaseMind';
import { getOpenAI, semanticSearch } from './rag';
import { createGinaMemory } from './ginaMemory';
import { 
  getZohoMCPConfig, 
  getZohoRecords,
  searchZohoRecords,
  callZohoMCP
} from './zohoMCP';
import {
  getRealms,
  listNotes,
  getNote,
  getNoteByQiD,
  createNote,
  updateNote,
  deleteNote,
} from './qinoteApi';
import { classifyNote } from './qinoteClassification';
import { seedQinote } from './seedQinote';

export interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  OPENAI_API_KEY: string;
  ZOHO_MCP_URL?: string;
  ZOHO_MCP_KEY?: string;
  WORKSPACE_ID?: string; // Optional workspace ID for single-tenant setups
  ALLOWED_ORIGINS?: string; // Comma-separated list of allowed origins for CORS
}

/**
 * Get CORS headers based on request origin and environment configuration
 */
function getCorsHeaders(request: Request, env: Env): Record<string, string> {
  const origin = request.headers.get('Origin');
  const allowedOrigins = env.ALLOWED_ORIGINS?.split(',').map(o => o.trim()) || [];
  
  // In production, only allow configured origins
  // In development, allow the request origin if present, otherwise allow all
  let allowOrigin = '*';
  
  if (origin) {
    // If specific origins are configured, check against them
    if (allowedOrigins.length > 0) {
      if (allowedOrigins.includes(origin)) {
        allowOrigin = origin;
      } else {
        // Origin not in allowed list - don't set CORS header
        allowOrigin = '';
      }
    } else {
      // No specific origins configured - allow the request origin
      allowOrigin = origin;
    }
  }

  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Workspace-Id',
    'Access-Control-Max-Age': '86400', // 24 hours
  };

  if (allowOrigin) {
    headers['Access-Control-Allow-Origin'] = allowOrigin;
    headers['Vary'] = 'Origin';
  }

  return headers;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // CORS headers
    const corsHeaders = getCorsHeaders(request, env);

    if (method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Initialize services
    const supabase = getSupabase(env);
    const openai = getOpenAI(env);
    
    // Initialize Zoho config (optional - may fail if not configured)
    let zohoConfig: ReturnType<typeof getZohoMCPConfig> | null = null;
    try {
      zohoConfig = getZohoMCPConfig(env);
    } catch (error) {
      // Zoho not configured - this is OK for endpoints that don't require it
      console.warn('Zoho MCP not configured:', error instanceof Error ? error.message : 'Unknown error');
    }

    // Health check
    if (path === '/' || path === '/health') {
      return new Response(
        JSON.stringify({
          status: 'ok',
          service: 'QiCockpit Gina Worker',
          zoho: zohoConfig?.mcpUrl ? 'configured' : 'not configured',
          endpoints: [
            'GET /health - Health check',
            'GET /api/qinote/realms - Get available realms',
            'GET /api/qinote/notes?realm=QiOne - List notes',
            'GET /api/qinote/notes/:id - Get note by ID',
            'POST /api/qinote/notes - Create note',
            'PUT /api/qinote/notes/:id - Update note',
            'DELETE /api/qinote/notes/:id - Soft delete note',
            'POST /api/gina/qinote - Gina chat with note creation',
            'POST /api/qinote/seed - Seed sample data',
            'GET /zoho/contacts - Get Zoho contacts',
            'POST /zoho/sync-contacts - Sync Zoho contacts to QiNodes',
            'GET /zoho/search?q=term&module=Contacts - Search Zoho',
            'POST /gina/chat - Chat with Gina',
            'GET /gina/search?q=query - Semantic search in QiNodes',
          ],
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Zoho: Get contacts
    if (path === '/zoho/contacts') {
      if (!zohoConfig) {
        return new Response(
          JSON.stringify({ error: 'Zoho MCP not configured. Set ZOHO_MCP_KEY environment variable.' }),
          { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      try {
        const result = await getZohoRecords(zohoConfig, 'Contacts', {
          per_page: 50,
          fields: 'id,First_Name,Last_Name,Email,Phone',
        });

        if (result.error) {
          return new Response(
            JSON.stringify({ error: result.error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ contacts: result.result?.data || [] }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error) {
        return new Response(
          JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Zoho: Sync contacts to QiNodes
    if (path === '/zoho/sync-contacts' && method === 'POST') {
      if (!zohoConfig) {
        return new Response(
          JSON.stringify({ error: 'Zoho MCP not configured. Set ZOHO_MCP_KEY environment variable.' }),
          { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      try {
        const result = await getZohoRecords(zohoConfig, 'Contacts', {
          per_page: 100,
          fields: 'id,First_Name,Last_Name,Email,Phone,Account_Name',
        });

        if (result.error) {
          return new Response(
            JSON.stringify({ error: result.error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const contacts = result.result?.data || [];
        let synced = 0;

        for (const contact of contacts) {
          const fullName = `${contact.First_Name || ''} ${contact.Last_Name || ''}`.trim();
          
          await createGinaMemory(supabase, openai, {
            qid: `1.04.10.${String(contact.id).slice(-3).padStart(3, '0')}`,
            realm: 'QiOne',
            orbit: 'Relationships-Community',
            system: 'Memory-Fact',
            title: fullName || 'Zoho Contact',
            body: `Zoho CRM Contact:
- Email: ${contact.Email || 'N/A'}
- Phone: ${contact.Phone || 'N/A'}
- Account: ${contact.Account_Name?.name || 'N/A'}
- Zoho ID: ${contact.id}`,
            ginaMeta: {
              type: 'fact',
              memory_type: 'fact',
              system_code: 10,
              confidence: 1.0,
              source: 'import',
              created_by: 'Gina',
              source_ref: `zoho:contact:${contact.id}`,
              tags: ['zoho', 'crm', 'contact'],
            },
          });
          synced++;
        }

        return new Response(
          JSON.stringify({ synced, total: contacts.length }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error) {
        return new Response(
          JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Zoho: Search
    if (path === '/zoho/search') {
      if (!zohoConfig) {
        return new Response(
          JSON.stringify({ error: 'Zoho MCP not configured. Set ZOHO_MCP_KEY environment variable.' }),
          { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const searchTerm = url.searchParams.get('q') || '';
      const module = url.searchParams.get('module') || 'Contacts';

      try {
        const result = await searchZohoRecords(zohoConfig, module, {
          word: searchTerm,
          per_page: 10,
        });

        if (result.error) {
          return new Response(
            JSON.stringify({ error: result.error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ results: result.result?.data || [] }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error) {
        return new Response(
          JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Gina: Semantic search in QiNodes
    if (path === '/gina/search') {
      const query = url.searchParams.get('q') || '';

      if (!query) {
        return new Response(
          JSON.stringify({ error: 'Query parameter "q" is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      try {
        const results = await semanticSearch(supabase, openai, query, {
          realm: 'QiOne',
          limit: 10,
        });

        return new Response(
          JSON.stringify({ results }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error) {
        return new Response(
          JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // ============================================================================
    // QiNote API Endpoints
    // ============================================================================

    // Get workspace ID from env or request header
    const workspaceId = env.WORKSPACE_ID || request.headers.get('X-Workspace-Id') || null;

    // GET /api/qinote/realms
    if (path === '/api/qinote/realms' && method === 'GET') {
      try {
        const realms = await getRealms();
        return new Response(
          JSON.stringify({ realms }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error) {
        return new Response(
          JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // GET /api/qinote/notes
    if (path === '/api/qinote/notes' && method === 'GET') {
      try {
        const realm = url.searchParams.get('realm') || undefined;
        const limit = parseInt(url.searchParams.get('limit') || '50', 10);
        const offset = parseInt(url.searchParams.get('offset') || '0', 10);

        const notes = await listNotes(supabase, {
          realm,
          workspace_id: workspaceId,
          limit,
          offset,
        });

        return new Response(
          JSON.stringify({ notes }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error) {
        return new Response(
          JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // GET /api/qinote/notes/:id
    if (path.startsWith('/api/qinote/notes/') && method === 'GET') {
      try {
        const id = path.split('/').pop();
        if (!id) {
          return new Response(
            JSON.stringify({ error: 'Note ID is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const note = await getNote(supabase, id, workspaceId);
        if (!note) {
          return new Response(
            JSON.stringify({ error: 'Note not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ note }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error) {
        return new Response(
          JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // POST /api/qinote/notes
    if (path === '/api/qinote/notes' && method === 'POST') {
      try {
        let body: {
          title: string;
          body?: string;
          realm: string;
          orbit?: string;
          system?: string;
          tags?: string[];
          meta?: Record<string, unknown>;
        };
        
        try {
          body = await request.json() as typeof body;
        } catch (parseError) {
          return new Response(
            JSON.stringify({ error: 'Invalid JSON in request body' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        if (!body.title || !body.realm) {
          return new Response(
            JSON.stringify({ error: 'Title and realm are required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const note = await createNote(supabase, body, workspaceId, 'QiNote');

        return new Response(
          JSON.stringify({ note }),
          {
            status: 201,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      } catch (error) {
        return new Response(
          JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // PUT /api/qinote/notes/:id
    if (path.startsWith('/api/qinote/notes/') && method === 'PUT') {
      try {
        const id = path.split('/').pop();
        if (!id) {
          return new Response(
            JSON.stringify({ error: 'Note ID is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        let body: {
          title?: string;
          body?: string;
          tags?: string[];
          meta?: Record<string, unknown>;
        };
        
        try {
          body = await request.json() as typeof body;
        } catch (parseError) {
          return new Response(
            JSON.stringify({ error: 'Invalid JSON in request body' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const note = await updateNote(supabase, id, body, workspaceId, 'QiNote');

        return new Response(
          JSON.stringify({ note }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error) {
        return new Response(
          JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // DELETE /api/qinote/notes/:id
    if (path.startsWith('/api/qinote/notes/') && method === 'DELETE') {
      try {
        const id = path.split('/').pop();
        if (!id) {
          return new Response(
            JSON.stringify({ error: 'Note ID is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        await deleteNote(supabase, id, workspaceId, 'QiNote');

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error) {
        return new Response(
          JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // POST /api/qinote/seed - Seed sample data
    if (path === '/api/qinote/seed' && method === 'POST') {
      try {
        const body = await request.json().catch(() => ({})) as { overwrite?: boolean };
        const result = await seedQinote(supabase, {
          workspace_id: workspaceId,
          overwrite: body.overwrite || false,
        });

        return new Response(
          JSON.stringify({
            success: true,
            created: result.created,
            errors: result.errors,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error) {
        return new Response(
          JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // ============================================================================
    // Gina Chat Endpoints
    // ============================================================================

    // POST /api/gina/qinote - Enhanced Gina chat with note creation
    if (path === '/api/gina/qinote' && method === 'POST') {
      try {
        let body: {
          messages: Array<{ role: string; content: string }>;
          context?: {
            realm?: string;
            activeNoteId?: string;
            userId?: string;
          };
        };
        
        try {
          body = await request.json() as typeof body;
        } catch (parseError) {
          return new Response(
            JSON.stringify({ error: 'Invalid JSON in request body' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
          return new Response(
            JSON.stringify({ error: 'Messages array is required and cannot be empty' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { messages, context } = body;
        const lastMessage = messages[messages.length - 1]?.content || '';

        // Search for context
        const searchContext = await semanticSearch(supabase, openai, lastMessage, {
          realm: context?.realm || 'QiOne',
          limit: 5,
        });

        // Classify the message to determine if we should create/update a note
        const classification = classifyNote(lastMessage, {
          contextRealm: context?.realm,
        });

        // Simple intent detection (MVP - can be enhanced with OpenAI function calling)
        const shouldCreateNote =
          lastMessage.toLowerCase().includes('create') ||
          lastMessage.toLowerCase().includes('save') ||
          lastMessage.toLowerCase().includes('note') ||
          lastMessage.toLowerCase().includes('remember') ||
          lastMessage.toLowerCase().includes('write down');

        const shouldUpdateNote =
          context?.activeNoteId &&
          (lastMessage.toLowerCase().includes('update') ||
           lastMessage.toLowerCase().includes('change') ||
           lastMessage.toLowerCase().includes('edit'));

        let noteCreated = null;
        let noteUpdated = null;

        // Create note if intent detected
        if (shouldCreateNote && !shouldUpdateNote) {
          try {
            // Extract title and body from message (simple MVP extraction)
            const lines = lastMessage.split('\n').filter(l => l.trim());
            const title = lines[0]?.replace(/^(create|save|note|remember|write down):?\s*/i, '').trim() ||
                         `Note from ${new Date().toLocaleDateString()}`;
            const body = lines.slice(1).join('\n') || lastMessage;

            const newNote = await createNote(supabase, {
              title,
              body,
              realm: classification.realm,
              orbit: classification.orbit,
              system: classification.system,
              tags: [],
              meta: {
                created_by_gina: true,
                classification,
              },
            }, workspaceId, 'Gina');

            noteCreated = newNote;

            // Generate embeddings for the new note
            try {
              const { upsertChunksForNode } = await import('./rag');
              await upsertChunksForNode({
                supabase,
                openai,
                qid: newNote.qid,
                realm: classification.realm,
                orbit: classification.orbit,
                system: classification.system,
                content: body,
                workspace_id: workspaceId,
                app_id: 'Gina',
              });
            } catch (embedError) {
              console.error('Failed to generate embeddings:', embedError);
              // Non-fatal - note is still created
            }
          } catch (createError) {
            console.error('Failed to create note:', createError);
            // Continue with response even if note creation fails
          }
        }

        // Update note if intent detected
        if (shouldUpdateNote && context?.activeNoteId) {
          try {
            const existing = await getNote(supabase, context.activeNoteId, workspaceId);
            if (existing) {
              const updates: { title?: string; body?: string } = {};

              // Simple extraction (can be enhanced)
              if (lastMessage.toLowerCase().includes('title:')) {
                const titleMatch = lastMessage.match(/title:\s*(.+)/i);
                if (titleMatch) updates.title = titleMatch[1].trim();
              }

              if (lastMessage.toLowerCase().includes('body:') || lastMessage.toLowerCase().includes('content:')) {
                const bodyMatch = lastMessage.match(/(?:body|content):\s*(.+)/is);
                if (bodyMatch) updates.body = bodyMatch[1].trim();
              } else {
                // If no explicit body, append to existing
                updates.body = existing.body ? `${existing.body}\n\n${lastMessage}` : lastMessage;
              }

              if (Object.keys(updates).length > 0) {
                const updated = await updateNote(supabase, context.activeNoteId, updates, workspaceId, 'Gina');
                noteUpdated = updated;
              }
            }
          } catch (updateError) {
            console.error('Failed to update note:', updateError);
            // Continue with response
          }
        }

        // Generate response message
        let assistantMessage = `I found ${searchContext.length} relevant notes in your brain.`;

        if (noteCreated) {
          assistantMessage += ` I've created a note "${noteCreated.title}" in ${classification.realm}.`;
        }

        if (noteUpdated) {
          assistantMessage += ` I've updated the note "${noteUpdated.title}".`;
        }

        if (searchContext.length > 0) {
          assistantMessage += ` Related notes: ${searchContext.slice(0, 3).map(r => r.qid).join(', ')}.`;
        }

        return new Response(
          JSON.stringify({
            assistant_message: assistantMessage,
            note_created: noteCreated,
            note_updated: noteUpdated,
            context: searchContext.map(r => ({ qid: r.qid, score: r.score })),
            classification,
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error) {
        console.error('Gina qinote error:', error);
        return new Response(
          JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Gina: Chat endpoint (basic implementation - kept for backward compatibility)
    if (path === '/gina/chat' && method === 'POST') {
      try {
        let body: { message: string; activeRealm?: string; activeNoteId?: string };
        
        try {
          body = await request.json() as typeof body;
        } catch (parseError) {
          console.error('Failed to parse request body:', parseError);
          return new Response(
            JSON.stringify({ error: 'Invalid JSON in request body' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        if (!body.message || typeof body.message !== 'string' || body.message.trim().length === 0) {
          return new Response(
            JSON.stringify({ error: 'Message is required and cannot be empty' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { message, activeRealm, activeNoteId } = body;
        const realm = activeRealm || 'QiOne';

        console.log('Gina chat request:', { message: message.substring(0, 50), realm, activeNoteId });

        // First, search QiNodes for context
        const context = await semanticSearch(supabase, openai, message, {
          realm: realm as any,
          limit: 5,
        });

        console.log('Gina found context:', { count: context.length });

        // Simple response (you can enhance this with OpenAI chat completion)
        const response = {
          message: `Gina here! I found ${context.length} relevant nodes in your ${realm} realm. ${context.length > 0 ? 'Here\'s what I found:' : 'Try asking me something more specific!'}`,
          context: context.map(r => ({ 
            qid: r.qid, 
            title: r.title || r.qid,
            score: r.score 
          })),
        };

        return new Response(
          JSON.stringify(response),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error) {
        console.error('Gina chat error:', error);
        return new Response(
          JSON.stringify({ 
            error: error instanceof Error ? error.message : 'Unknown error',
            details: error instanceof Error ? error.stack : undefined
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    return new Response('Not found', { status: 404, headers: corsHeaders });
  },

  // Scheduled task: Daily Zoho sync
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    const supabase = getSupabase(env);
    const openai = getOpenAI(env);
    
    // Initialize Zoho config (optional)
    let zohoConfig: ReturnType<typeof getZohoMCPConfig> | null = null;
    try {
      zohoConfig = getZohoMCPConfig(env);
    } catch (error) {
      // Zoho not configured - skip sync
      console.warn('Daily Zoho sync skipped: Zoho MCP not configured');
      return;
    }

    // Daily Zoho sync (silent in production)
    try {
      if (!zohoConfig) {
        return;
      }
      
      const result = await getZohoRecords(zohoConfig, 'Contacts', {
        per_page: 100,
        fields: 'id,First_Name,Last_Name,Email,Phone',
      });

      if (result.error) {
        console.error('Daily Zoho sync error:', result.error.message);
      } else {
        // Sync completed (logged in Cloudflare dashboard)
        console.log('Daily Zoho sync completed successfully');
      }
    } catch (error) {
      console.error('Daily Zoho sync failed:', error);
    }
  },
};

