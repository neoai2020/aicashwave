import { NextResponse } from "next/server";
import { callChatGPT } from "@/lib/llm";
import { lastAiProvider } from "@/lib/openrouter";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    const secret = process.env.AI_HEALTH_SECRET;
    if (!secret || req.headers.get("x-ai-health-secret") !== secret) {
        return new NextResponse(null, { status: 404 });
    }

    const start = Date.now();
    try {
        const text = await callChatGPT([{ role: "user", content: "Reply with the single word ok" }]);
        return NextResponse.json(
            { ok: true, provider: lastAiProvider, ms: Date.now() - start, sample: text.substring(0, 40) },
            { headers: { "Cache-Control": "no-store" } }
        );
    } catch (error: any) {
        return NextResponse.json(
            { ok: false, error: error?.message || String(error), ms: Date.now() - start },
            { status: 502, headers: { "Cache-Control": "no-store" } }
        );
    }
}
