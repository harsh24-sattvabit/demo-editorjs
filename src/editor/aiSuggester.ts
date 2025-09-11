// Lightweight AI suggester abstraction.
// Replace the implementation of fetchSuggestionWithProvider to call a real API.

export type SuggestionContext = {
  textBeforeCursor: string;
  blockType?: string;
};

async function fetchSuggestionWithProvider(
  context: SuggestionContext
): Promise<string> {
  // Placeholder logic. Integrate your AI provider here.
  // Example (pseudo):
  // const resp = await fetch("/api/ai/suggest", { method: "POST", body: JSON.stringify(context) });
  // const { suggestion } = await resp.json();
  // return suggestion ?? "";

  const { textBeforeCursor } = context;
  if (!textBeforeCursor || textBeforeCursor.trim().length < 3) return "";

  // Naive mock completion based on the last word
  const lastWord = textBeforeCursor.split(/\s+/).filter(Boolean).pop() ?? "";
  if (lastWord.length < 3) return "";

  const canned: Record<string, string> = {
    hello: " world",
    intro: "duction",
    exam: "ple",
    write: " more details",
  };
  const key = lastWord.toLowerCase();
  if (canned[key]) return canned[key];

  // Fallback generic filler
  return "…";
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
