import type { Request } from "express";

/** Derive the public origin for building absolute links (preview/production/dev). */
export function getOrigin(req?: Request): string {
  // Explicit override (useful in local dev proxy)
  if (process.env.FRONTEND_URL && process.env.FRONTEND_URL.trim() !== "") {
    // If multiple URLs (comma-separated), use the first one
    return process.env.FRONTEND_URL.split(",")[0].trim();
  }

  // Prefer proxy headers (Vercel / tunnels)
  const xfProto = header(req, "x-forwarded-proto");
  const xfHost  = header(req, "x-forwarded-host") || header(req, "host");
  if (xfHost) return `${xfProto || "https"}://${xfHost}`;

  // Vercel provides VERCEL_URL (no protocol)
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;

  // Fallback: local dev
  return "http://localhost:5173";
}

function header(req: Request | undefined, name: string): string | undefined {
  const v = req?.headers?.[name.toLowerCase()];
  if (!v) return undefined;
  if (Array.isArray(v)) return v[0];
  return v as string;
}

