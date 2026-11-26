import { NextResponse } from "next/server";
import { requireApiUser, clampString } from "@/lib/api-auth";
import { analyzeOffer } from "@/lib/dfy/offer-analyze";
import type { AudienceMode } from "@/lib/dfy/types";
import { normalizeWebUrl } from "@/lib/safe-url";

export async function POST(req: Request) {
    const auth = await requireApiUser();
    if (auth.unauthorized) return auth.unauthorized;

    try {
        const body = await req.json();
        const rawUrl = clampString(body.url, 500);
        const url = normalizeWebUrl(rawUrl);
        const audienceMode = (clampString(body.audienceMode, 30) || "auto") as AudienceMode;

        if (!rawUrl) {
            return NextResponse.json({ error: "Please paste a product or affiliate link." }, { status: 400 });
        }

        if (!url) {
            return NextResponse.json({ error: "That doesn't look like a valid link. Enter a valid link, e.g. google.com." }, { status: 400 });
        }

        const snapshot = await analyzeOffer(url, audienceMode);
        return NextResponse.json({ snapshot });
    } catch {
        return NextResponse.json(
            { error: "We couldn't analyze that page right now. Try again or use the product URL directly." },
            { status: 500 },
        );
    }
}
