/**
 * Metadata + Naming Enforcer Worker v0.1 (Cloudflare)
 * Layer: 4 (Naming) + Layer 5 (Metadata)
 *
 * Responsibilities:
 * - Enforce Layer 4: QiOS Naming Law (slug.ext, no dates, no meaning in filenames)
 * - Enforce Layer 5: Complete front matter (required fields, valid timestamps, QiDecimal integrity)
 * - Detect violations: missing front matter, invalid slugs, dates in filenames
 * - Propose fixes (but don't auto-rename without human approval)
 * - Record violations to file_history (event_type: 'naming_violation' | 'metadata_violation', actor: 'metadata_naming')
 * - Publish heartbeat + errors to worker_status
 */

import { createClient } from "@supabase/supabase-js";
import { heartbeat, fail } from "../_shared/heartbeat.ts";
import { isIgnored } from "../_shared/ignore.ts";

type Env = {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  WORKER_ID: string; // "metadata_naming"
};

function sb(env: Env) {
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
}

// Layer 4: Naming Law violations
function checkNamingViolations(filePath: string, slug: string): string[] {
  const violations: string[] = [];

  // Check for dates in filename (YYYY-MM-DD or similar patterns)
  const datePattern = /\d{4}[-_]\d{2}[-_]\d{2}/;
  if (datePattern.test(filePath)) {
    violations.push("date_in_filename");
  }

  // Check for version numbers in filename (v2, v1.0, etc.)
  const versionPattern = /[_-]v?\d+([._]\d+)*/i;
  if (versionPattern.test(filePath) && !filePath.includes("_readme.md")) {
    violations.push("version_in_filename");
  }

  // Check slug format (must be lowercase_underscored)
  const slugPattern = /^[a-z0-9_]+$/;
  if (!slugPattern.test(slug)) {
    violations.push("invalid_slug_format");
  }

  // Check for kebab-case or camelCase
  if (slug.includes("-")) {
    violations.push("kebab_case_in_slug");
  }
  if (/[A-Z]/.test(slug)) {
    violations.push("camelCase_in_slug");
  }

  return violations;
}

// Layer 5: Metadata violations
function checkMetadataViolations(profile: any): string[] {
  const violations: string[] = [];
  const required = ["title", "slug", "realm", "type", "node", "created", "updated"];

  // Check required fields
  for (const field of required) {
    if (!profile[field] && profile[field] !== 0) {
      violations.push(`missing_${field}`);
    }
  }

  // Check timestamp format (ISO 8601)
  if (profile.created && !isValidISO8601(profile.created)) {
    violations.push("invalid_created_timestamp");
  }
  if (profile.updated && !isValidISO8601(profile.updated)) {
    violations.push("invalid_updated_timestamp");
  }

  // Check QiDecimal format (##.##.##-TYPE)
  if (profile.qi_decimal && !/^\d+\.\d+\.\d+-[A-Z]+$/.test(profile.qi_decimal)) {
    violations.push("invalid_qidecimal_format");
  }

  return violations;
}

function isValidISO8601(dateString: string): boolean {
  const iso8601Pattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
  return iso8601Pattern.test(dateString) && !isNaN(Date.parse(dateString));
}

async function pullProfilesToCheck(env: Env, limit = 20) {
  const supa = sb(env);
  // Get semantic profiles that need checking
  const { data, error } = await supa
    .from("semantic_profile")
    .select("*")
    .not("file_path", "is", null)
    .order("updated_at", { ascending: true })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

async function recordViolation(
  env: Env,
  profile: any,
  violationType: "naming" | "metadata",
  violations: string[]
) {
  const supa = sb(env);
  await supa.from("file_history").insert({
    file_path: profile.file_path,
    qid: profile.qid,
    event_type: `${violationType}_violation`,
    actor: "metadata_naming",
    meta: {
      violations,
      file_path: profile.file_path,
      slug: profile.slug,
      realm: profile.realm,
    },
    created_at: new Date().toISOString(),
  });
}

async function processProfile(env: Env, profile: any) {
  // 0) Check if file should be ignored (Dark Matter protection)
  if (isIgnored(profile.file_path)) {
    return; // Skip checking ignored files
  }

  const namingViolations = checkNamingViolations(profile.file_path, profile.slug || "");
  const metadataViolations = checkMetadataViolations(profile);

  if (namingViolations.length > 0) {
    await recordViolation(env, profile, "naming", namingViolations);
  }

  if (metadataViolations.length > 0) {
    await recordViolation(env, profile, "metadata", metadataViolations);
  }
}

export default {
  async fetch(req: Request, env: Env, _ctx: ExecutionContext): Promise<Response> {
    const workerId = env.WORKER_ID || "metadata_naming";
    const url = new URL(req.url);
    const path = url.pathname;

    try {
      if (path === "/health" && req.method === "GET") {
        const supa = sb(env);
        const { data: status } = await supa
          .from("worker_status")
          .select("*")
          .eq("worker_id", workerId)
          .single();

        return new Response(
          JSON.stringify({
            ok: true,
            worker_id: workerId,
            state: status?.state || "gray",
            last_heartbeat: status?.last_heartbeat || null,
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      return new Response("Not found", { status: 404 });
    } catch (e: any) {
      await fail(env, workerId, "WKR.FETCH_ERROR", e.message || String(e));
      return new Response(
        JSON.stringify({ ok: false, error: e.message || String(e) }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  },

  async scheduled(_event: ScheduledEvent, env: Env, _ctx: ExecutionContext) {
    const workerId = env.WORKER_ID || "metadata_naming";

    try {
      await heartbeat(env, workerId, "green", { phase: "scheduled_start" });

      const profiles = await pullProfilesToCheck(env, 20);

      if (profiles.length === 0) {
        await heartbeat(env, workerId, "green", { phase: "idle" });
        return;
      }

      for (const profile of profiles) {
        try {
          await processProfile(env, profile);
          await heartbeat(env, workerId, "green", {
            last_checked: profile.file_path,
          });
        } catch (e: any) {
          await fail(env, workerId, "METADATA.CHECK_FAIL", e.message || String(e), {
            file_path: profile.file_path,
          });
        }
      }

      await heartbeat(env, workerId, "green", {
        phase: "batch_complete",
        checked: profiles.length,
      });
    } catch (e: any) {
      await fail(env, workerId, "WKR.QUEUE_STALL", e.message || String(e));
      throw e;
    }
  },
};

