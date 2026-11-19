import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

/** Railway calls this before switching traffic to a new deploy. */
export function GET() {
  try {
    getDb().prepare("SELECT 1").get();
    return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ ok: false }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
