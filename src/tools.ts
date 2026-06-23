import Anthropic from "@anthropic-ai/sdk";
import {
  getCurrentTime,
  getCurrentTimeToolDefinition,
} from "./tools/get-current-time.js";

export type ToolFunction = (args: Record<string, unknown>) => Promise<string>;

export const customToolDefinitions: Anthropic.Tool[] = [
  getCurrentTimeToolDefinition,
] as const;

const customTools: Record<string, ToolFunction> = {
  get_current_time: getCurrentTime,
} as const;

export async function invokeTool(
  response: Anthropic.Message,
): Promise<Anthropic.ToolResultBlockParam[]> {
  const toolResults: Anthropic.ToolResultBlockParam[] = [];

  for (const toolUseBlock of response.content.filter(
    (block) => block.type === "tool_use",
  )) {
    const { id: toolUseId, name: toolName, input: args } = toolUseBlock;
    const tool = customTools[toolName];
    const toolResult = await tool(args as Record<string, unknown>);
    toolResults.push({
      type: "tool_result",
      tool_use_id: toolUseId,
      content: toolResult,
    });
  }

  return toolResults;
}
