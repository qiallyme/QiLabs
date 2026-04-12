import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/server";

export async function POST(req: NextRequest) {
  const body = await req.json();

  await db.from("archive_files").upsert({
    archive_id: body.archive_id,
    domain_prefix: body.domain_prefix,
    short_code: body.short_code,
    original_filename: body.original_filename,
    normalized_filename: body.normalized_filename,
    sha256: body.sha256,
    source_path: body.source_path,
    status: body.status,
    extracted_text: body.extracted_text ?? null,
  });

  return NextResponse.json({ ok: true });
}