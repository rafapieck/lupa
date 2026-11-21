import { NextResponse, type NextRequest } from "next/server";
import { parseShare } from "@/lib/share";

// Invalid share links must answer a real HTTP 404 (PACKET §14b: green,
// unknown ids, 7 ids…). The share page streams, so notFound() inside it
// can't change a status that was already sent. Validate here first, with the
// same pure parseShare() the page uses, and rewrite bad links to a path no
// route matches, which renders the normal not-found page with status 404.
export function proxy(request: NextRequest) {
  const parts = request.nextUrl.pathname.split("/").slice(2); // after "/s/"
  const [verdict, patterns, extra] = parts;
  const isCard = parts.length === 2;
  const isImage = parts.length === 3 && extra.startsWith("opengraph-image");
  if ((isCard || isImage) && !parseShare(verdict, patterns)) {
    return NextResponse.rewrite(new URL("/_aviso-no-encontrado", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: "/s/:path*",
};
