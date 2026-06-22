import Anthropic from "@anthropic-ai/sdk";
import { getToolDefinitions, isToolName, runTool } from "./tools.js";

export type AgentState = {
  anthropic: Anthropic;
  messages: Anthropic.Messages.MessageParam[];
};

export function createAgent(apiKey: string): AgentState {
  return {
    anthropic: new Anthropic({ apiKey }),
    messages: [],
  };
}

export async function runAgentTurn(
  agent: AgentState,
  userInput: string,
): Promise<string> {
  agent.messages.push({ role: "user", content: userInput });
  return getAssistantResponse(agent);
}

async function getAssistantResponse(agent: AgentState): Promise<string> {
  let response = await agent.anthropic.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 1024,
    tools: getToolDefinitions(),
    messages: agent.messages,
  });

  while (response.stop_reason === "tool_use") {
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

    agent.messages.push({
      role: "assistant",
      content: response.content,
    });
    agent.messages.push({
      role: "user",
      content: toolResults,
    });

    response = await agent.anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 1024,
      tools: getToolDefinitions(),
      messages: agent.messages,
    });
  }

  agent.messages.push({
    role: "assistant",
    content: response.content,
  });

  return (
    response.content
      .filter((contentBlock) => contentBlock.type === "text")
      .map((contentBlock) => contentBlock.text)
      .join("\n")
      .trim() || "(No text response)"
  );
}
