import Anthropic from "@anthropic-ai/sdk";

export const getCurrentTimeToolDefinition: Anthropic.Tool = {
  name: "get_current_time",
  description: "Get the current local date and time",
  input_schema: {
    type: "object",
    properties: {},
    required: [],
  },
};

export async function getCurrentTime() {
  return new Date().toLocaleString();
}
