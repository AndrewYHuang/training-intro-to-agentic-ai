import type { Tool } from "@anthropic-ai/sdk/resources/messages/messages";
import { currentTimeTool } from "./tools/current-time.js";
import { webSearchTool } from "./tools/web-search.js";

export type LocalTool = {
  definition: Tool;
  run: (args: Record<string, unknown>) => Promise<string>;
};

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
