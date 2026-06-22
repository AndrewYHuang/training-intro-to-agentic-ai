import type { Tool } from "@anthropic-ai/sdk/resources/messages/messages";
import { currentTimeTool } from "./tools/current-time.js";
import Anthropic from "@anthropic-ai/sdk";

export type CustomTool = {
  definition: Tool;
  run: (args: Record<string, unknown>) => Promise<string>;
};

const tools = {
  current_time: currentTimeTool,
} as const;

export type ToolName = keyof typeof tools;

export function getToolDefinitions(): Tool[] {
  return Object.values(tools).map((tool) => tool.definition);
}

export function isToolName(value: string): value is ToolName {
  return value in tools;
}

export async function runTool(
  toolName: string,
  args: Record<string, unknown>,
): Promise<string> {
  if (!isToolName(toolName)) {
    throw new Error(`Tool name not registered ${toolName}`);
  }
  return tools[toolName].run(args);
}

export async function invokeTool(
  response: Anthropic.Messages.Message,
): Promise<Anthropic.Messages.ToolResultBlockParam[]> {
  const toolResults: Anthropic.Messages.ToolResultBlockParam[] = [];

  for (const contentBlock of response.content) {
    if (contentBlock.type !== "tool_use") continue;

    const toolResult = await runTool(
      contentBlock.name,
      contentBlock.input as Record<string, unknown>,
    );

    toolResults.push({
      type: "tool_result",
      tool_use_id: contentBlock.id,
      content: toolResult,
    });
  }

  return toolResults;
}
