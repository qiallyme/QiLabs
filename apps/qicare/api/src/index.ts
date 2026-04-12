import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';

// Define the Cloudflare Bindings (Environment Variables mapping)
type Bindings = {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
};

// Define variables passed down into the request context via middleware
type Variables = {
  supabase: SupabaseClient;
  user: User;
};

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// 1. Strict CORS for QiCare Production
app.use(
  '*',
  cors({
    origin: ['https://care.qially.com', 'http://localhost:5173', 'http://localhost:5179'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'apikey'],
    exposeHeaders: ['Content-Length'],
    maxAge: 600,
    credentials: true,
  })
);

// 2. Auth & Supabase Service-Role Middleware for API routes
app.use('/api/*', async (c, next) => {
  // If the secret isn't bound properly, fail safely
  if (!c.env.SUPABASE_URL || !c.env.SUPABASE_SERVICE_ROLE_KEY) {
    return c.json({ error: 'Server configuration error: Missing DB secrets' }, 500);
  }

  // Initialize the bypass client directly targeting the qihealth isolated schema
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
    db: { schema: 'qihealth' },
  });
  
  // Enforce security by checking the user's JWT from the request header
  const authHeader = c.req.header('Authorization');
  if (!authHeader) {
    return c.json({ error: 'Missing Authorization header' }, 401);
  }

  const token = authHeader.replace(/^Bearer\s+/i, '');
  
  // Verify the JWT is completely valid with Supabase Auth
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);

  if (authError || !user) {
    return c.json({ error: 'Unauthorized', details: authError }, 401);
  }

  // Inject the authenticated user and service client into the context for down-stream routes
  c.set('user', user);
  c.set('supabase', supabase);
  await next();
});

// Root Healthcheck
app.get('/', (c) => c.json({ status: "online", message: "QiCare API Gatekeeper is active and secured." }));

// ---------------------------------------------------------
// SECURED PROTECTED DOMAIN ROUTES
// ---------------------------------------------------------

// FETCH PATIENTS
app.get('/api/patients', async (c) => {
  const supabase = c.get('supabase');
  const user = c.get('user');

  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .eq('owner_id', user.id);

  if (error) return c.json({ error: error.message }, 500);
  return c.json({ patients: data });
});

// FETCH CARE EVENTS
app.get('/api/care-events', async (c) => {
  const supabase = c.get('supabase');
  const user = c.get('user');

  const { data, error } = await supabase
    .from('care_events')
    .select('*')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false });

  if (error) return c.json({ error: error.message }, 500);
  return c.json({ events: data });
});


// ---------------------------------------------------------
// PUBLIC / UNPROTECTED ROUTES
// ---------------------------------------------------------

// Knowledge Base
app.get('/kb', (c) => {
  const articles = [
    { title: "How to use Voice Commands", content: "Click the microphone icon and speak naturally. Use phrases like 'Mom took 2 tylenol' or 'Start breathing treatment'." },
    { title: "COPD Safety Protocols", content: "Monitor O2 levels. If O2 falls below 88% or breathing becomes distressed, follow the escalation protocol." }
  ];
  return c.json(articles);
});

// Symptom Evaluation
app.post('/symptoms/evaluate', async (c) => {
  try {
    const { pain_level, breathing_status } = await c.req.json();
    
    let action = "MONITOR";
    let message = "Keep monitoring patient. Document any changes in the timeline.";

    if (pain_level >= 7 || breathing_status === "distressed") {
      action = "ESCALATE";
      message = "High pain or breathing distress detected. Contact provider or check emergency protocol immediately.";
    }

    return c.json({ action, message });
  } catch (error) {
    return c.json({ error: "Invalid input" }, 400);
  }
});

export default app;
