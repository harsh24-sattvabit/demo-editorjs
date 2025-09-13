// Lightweight AI suggester abstraction.
// Replace the implementation of fetchSuggestionWithProvider to call a real API.

export type SuggestionContext = {
  textBeforeCursor: string;
  blockType?: string;
};

async function fetchSuggestionWithProvider(
  context: SuggestionContext
): Promise<string> {
  const prompt = context.textBeforeCursor ?? "";
  if (!prompt || prompt.trim().length < 3) return "";

  const apiKey = (import.meta as ImportMeta).env.VITE_OPENAI_API_KEY;
  if (!apiKey) return "";

  try {
    const r = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers":
          "authorization, x-client-info, apikey, content-type",
      },
      body: JSON.stringify({
        model: "gpt-5",
        input: `Return a short continuation only. No prefixes.\n\n${prompt}`,
        temperature: 0.2,
        max_output_tokens: 40,
      }),
    });
    if (!r.ok) return "";
    const j = (await r.json()) as {
      output_text?: string;
      output?: Array<{ content?: Array<{ text?: string }> }>;
    };
    const fromOutputArray = j?.output?.[0]?.content?.[0]?.text || "";
    const suggestion = (j.output_text || fromOutputArray || "").trim();
    return suggestion;
  } catch {
    return "";
  }
}

export async function getSuggestion(
  context: SuggestionContext
): Promise<string> {
  try {
    const suggestion = await fetchSuggestionWithProvider(context);
    return suggestion || "";
  } catch {
    return "";
  }
}
