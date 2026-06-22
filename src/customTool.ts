import Anthropic from "@anthropic-ai/sdk";
import { currentTimeTool } from "./tools/current-time.js";

export type CustomTool = {
  definition: Anthropic.Tool;
  run: (args: Record<string, unknown>) => Promise<string>;
};

const customTools = {
  current_time: currentTimeTool,
} as const;


export function getToolDefinitions(): Anthropic.Tool[] {
  return Object.values(customTools).map((tool) => tool.definition);
}

function isToolName(name: string): name is keyof typeof customTools {
  return name in customTools;
}

export async function invokeTool(
  response: Anthropic.Message,
): Promise<Anthropic.ToolResultBlockParam[]> {
  const toolResults: Anthropic.ToolResultBlockParam[] = [];

  for (const contentBlock of response.content) {
    if (contentBlock.type !== "tool_use") continue;
    const { id: toolUseId, name: toolName, input: args } = contentBlock

    console.log(`Custom tool use: ${toolName} called with ${JSON.stringify(args)}`)
    console.log()

    if (!isToolName(toolName)) {
      throw new Error(`Tool name not registered ${toolName}`);
    }

    const toolResult = await customTools[toolName].run(args as Record<string, unknown>);

    toolResults.push({
      type: "tool_result",
      tool_use_id: toolUseId,
      content: toolResult,
    });
  }

  return toolResults;
}
