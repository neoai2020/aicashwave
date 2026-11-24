export type AiProvider = 'openrouter' | 'rapidapi' | null;

export let lastAiProvider: AiProvider = null;

export function setLastAiProvider(provider: AiProvider) {
    lastAiProvider = provider;
}

export function isOpenRouterConfigured(): boolean {
    return !!process.env.OPENROUTER_API_KEY?.trim();
}

export async function openRouterChat(
    messages: { role: string; content: string }[],
    opts: { temperature?: number; maxTokens?: number; timeoutMs?: number } = {}
): Promise<string> {
    const apiKey = process.env.OPENROUTER_API_KEY?.trim();
    if (!apiKey) {
        throw new Error('Missing OPENROUTER_API_KEY');
    }

    const model = process.env.OPENROUTER_MODEL?.trim() || 'openai/gpt-4o-mini';
    const referer = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || '';

    const headers: Record<string, string> = {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'X-Title': 'AI CashWave'
    };
    if (referer) headers['HTTP-Referer'] = referer;

    const body: Record<string, unknown> = { model, messages };
    if (opts.temperature !== undefined) body.temperature = opts.temperature;
    if (opts.maxTokens !== undefined) body.max_tokens = opts.maxTokens;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(opts.timeoutMs ?? 45000)
    });

    if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        throw new Error(`OpenRouter API Error: ${response.status} - ${errorText.substring(0, 300)}`);
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    if (typeof content !== 'string' || !content.trim()) {
        throw new Error('OpenRouter API Error: empty response');
    }

    return content;
}
