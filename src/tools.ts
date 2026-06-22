import type { Tool } from "@anthropic-ai/sdk/resources/messages/messages";
import { currentTimeTool } from "./tools/current-time.js";
import { webSearchTool } from "./tools/web-search.js";
import Anthropic from "@anthropic-ai/sdk";

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

export async function handleToolUseCall(
  agent: Anthropic,
  messages: Anthropic.Messages.MessageParam[],
  response: Anthropic.Messages.Message,
) {
  const toolResults: Anthropic.Messages.ToolResultBlockParam[] = [];

  for (const contentBlock of response.content) {
    if (contentBlock.type !== "tool_use") {
      continue;
    }
    if (!isToolName(contentBlock.name)) {
      toolResults.push({
        type: "tool_result",
        tool_use_id: contentBlock.id,
        content: `Tool "${contentBlock.name}" is not registered.`,
      });
      continue;
    }
    if (
      contentBlock.input === null ||
      typeof contentBlock.input !== "object" ||
      Array.isArray(contentBlock.input)
    ) {
      toolResults.push({
        type: "tool_result",
        tool_use_id: contentBlock.id,
        content: "Invalid tool arguments. Expected a JSON object.",
      });
      continue;
    }

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

  messages.push({
    role: "assistant",
    content: response.content,
  });
  messages.push({
    role: "user",
    content: toolResults,
  });

  response = await agent.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 1024,
    tools: getToolDefinitions(),
    messages,
  });
}
