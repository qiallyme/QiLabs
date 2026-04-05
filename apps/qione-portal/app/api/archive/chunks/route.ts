import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/server";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const rows = body.records.map((r: any) => ({
    archive_id: r.archive_id,
    chunk_index: r.chunk_index,
    text: r.text,
    embedding: r.embedding,
  }));

  await db.from("archive_chunks").insert(rows);
  return NextResponse.json({ ok: true, inserted: rows.length });
}