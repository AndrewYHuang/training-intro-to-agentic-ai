import type { Tool } from "@anthropic-ai/sdk/resources/messages/messages";

export type LocalTool = {
  definition: Tool;
  run: (args: Record<string, unknown>) => Promise<string>;
};
