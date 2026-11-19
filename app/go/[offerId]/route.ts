import { NextResponse, type NextRequest } from "next/server";
import { buildOutboundUrl, parseEntryPoint } from "@/lib/affiliate";
import { currentUser } from "@/lib/auth";
import { getOffer, type Offer } from "@/lib/catalog";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ offerId: string }> };

const HEADERS = { "X-Robots-Tag": "noindex", "Cache-Control": "no-store" };

function notFound() {
  return new NextResponse("Offer not found", { status: 404, headers: HEADERS });
}

/** The destination only ever comes from the catalog, never from the request. */
function redirectTo(offer: Offer) {
  return new NextResponse(null, {
    status: 302,
    headers: { ...HEADERS, Location: buildOutboundUrl(offer) },
  });
}

export async function GET(request: NextRequest, { params }: Context) {
  const { offerId } = await params;
  const found = getOffer(offerId);
  if (!found) return notFound();

  try {
    const user = await currentUser();
    getDb()
      .prepare("INSERT INTO affiliate_clicks (offer_id, user_id, entry_point) VALUES (?, ?, ?)")
      .run(found.offer.id, user?.id ?? null, parseEntryPoint(request.nextUrl.searchParams.get("from")));
  } catch (error) {
    console.error("Could not record affiliate click", error);
  }

  return redirectTo(found.offer);
}

/** Link checkers send HEAD requests. Answer them without counting a click. */
export async function HEAD(_request: NextRequest, { params }: Context) {
  const { offerId } = await params;
  const found = getOffer(offerId);
  return found ? redirectTo(found.offer) : notFound();
}
