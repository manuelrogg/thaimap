import { placesEnabled } from "@/lib/places";

// Photo proxy. Place Photos (New) requires the API key on each media request;
// proxying server-side keeps the key off the client. We stream Google's image
// through and set a SHORT cache-control (ToS: no long-term caching of photos).
//
// Used only when live photos exist (flag on). With the flag off there are no
// photo refs pointing here, so this route is never hit.

const BASE = "https://places.googleapis.com/v1";

export async function GET(req: Request): Promise<Response> {
  if (!placesEnabled()) {
    return new Response("Places API disabled", { status: 404 });
  }

  const { searchParams } = new URL(req.url);
  const name = searchParams.get("name");
  const w = searchParams.get("w") ?? "800";

  // Expect a Google photo resource name: places/PLACE_ID/photos/PHOTO_RESOURCE
  if (!name || !/^places\/[^/]+\/photos\/[^/]+$/.test(name)) {
    return new Response("Bad photo name", { status: 400 });
  }
  if (!/^\d{1,4}$/.test(w)) {
    return new Response("Bad width", { status: 400 });
  }

  const upstream = `${BASE}/${name}/media?maxWidthPx=${w}&key=${process.env.GOOGLE_PLACES_API_KEY}`;
  const res = await fetch(upstream, { signal: AbortSignal.timeout(8_000) });
  if (!res.ok || !res.body) {
    return new Response("Upstream photo error", { status: 502 });
  }

  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.startsWith("image/")) {
    return new Response("Unexpected upstream content type", { status: 502 });
  }

  const contentLength = parseInt(res.headers.get("content-length") ?? "0", 10);
  if (contentLength > 10_000_000) {
    return new Response("Upstream response too large", { status: 502 });
  }

  return new Response(res.body, {
    headers: {
      "content-type": contentType,
      "content-disposition": "inline",
      "cache-control": "public, max-age=3600", // short-term only (Google ToS)
    },
  });
}
