import { NextResponse } from "next/server";
import { requireApiUser, clampString } from "@/lib/api-auth";
import { buildMachine } from "@/lib/traffic-machine/machine-service";
import type { TrafficGoal } from "@/lib/traffic-machine/types";
import { normalizeWebUrl } from "@/lib/safe-url";

export async function POST(req: Request) {
  const auth = await requireApiUser();
  if (auth.unauthorized) return auth.unauthorized;

  try {
    const body = await req.json();
    const rawOfferUrl = clampString(body.offerUrl, 500);
    const offerUrl = normalizeWebUrl(rawOfferUrl);
    const audienceNiche = clampString(body.audienceNiche, 40) || "not_sure";
    const goal = (clampString(body.goal, 20) || "visitors") as TrafficGoal;

    if (!rawOfferUrl) {
      return NextResponse.json({ error: "Please paste your page or affiliate link." }, { status: 400 });
    }

    if (!offerUrl) {
      return NextResponse.json({ error: "That doesn't look like a valid link. Try e.g. google.com." }, { status: 400 });
    }

    const result = await buildMachine(auth.supabase, auth.user.id, offerUrl, audienceNiche, goal);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "We couldn't build your Traffic Machine right now. Please try again." },
      { status: 500 },
    );
  }
}
