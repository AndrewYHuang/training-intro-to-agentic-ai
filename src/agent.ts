import Anthropic from "@anthropic-ai/sdk";
import { getToolDefinitions, handleToolUseCall } from "./tools.js";

export async function runAgentTurn(
  agent: Anthropic,
  messages: Anthropic.Messages.MessageParam[],
  userInput: string,
): Promise<string> {
  messages.push({ role: "user", content: userInput });
  return getAssistantResponse(agent, messages);
}

async function getAssistantResponse(
  agent: Anthropic,
  messages: Anthropic.Messages.MessageParam[],
): Promise<string> {
  let response = await agent.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 1024,
    tools: getToolDefinitions(),
    messages: messages,
  });

  while (response.stop_reason === "tool_use") {
    response = await handleToolUseCall(agent, messages, response);
  }

  messages.push({
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
