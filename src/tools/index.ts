import type { Tool } from "@anthropic-ai/sdk/resources/messages/messages";
import { currentTimeTool } from "./current-time.js";
import { webSearchTool } from "./web-search.js";
import { LocalTool } from "./types.js";

const tools = {
  current_time: currentTimeTool,
  web_search: webSearchTool,
} as const satisfies Record<string, LocalTool>;

export type ToolName = keyof typeof tools;

export function getToolDefinitions(): Tool[] {
  return Object.values(tools).map((tool) => tool.definition);
}

export function isToolName(value: string): value is ToolName {
  return value in tools;
}

export async function runTool(
  toolName: ToolName,
  args: Record<string, unknown>,
): Promise<string> {
  return tools[toolName].run(args);
}
