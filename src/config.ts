export const DEFAULT_ANTHROPIC_MODEL = "claude-haiku-4-5";

export function getAnthropicConfig() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("Missing ANTHROPIC_API_KEY environment variable.");
  }

  const model = process.env.ANTHROPIC_MODEL ?? DEFAULT_ANTHROPIC_MODEL;
  return { apiKey, model };
}

export function getRecipeAPIConfig() {
  return process.env.RECIPEAPI_API_KEY;
}
