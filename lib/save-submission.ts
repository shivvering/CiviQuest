import type { SaveDataInput } from "./research-types";

export async function saveSubmission(
  input: SaveDataInput,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const response = await fetch("/api/quiz-submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const data = (await response.json()) as { error?: string };
    if (!response.ok) {
      return {
        ok: false,
        error: data.error ?? `Save failed (${response.status})`,
      };
    }
    return { ok: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to save submission";
    return { ok: false, error: message };
  }
}
