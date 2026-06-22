import Anthropic from "@anthropic-ai/sdk";
import { buildToolResults, getToolDefinitions } from "./tools.js";

export async function runAgentTurn(
  agent: Anthropic,
  messages: Anthropic.Messages.MessageParam[],
  userInput: string,
  model: string,
): Promise<string> {
  messages.push({ role: "user", content: userInput });
  return getAssistantResponse(agent, messages, model);
}

async function getAssistantResponse(
  agent: Anthropic,
  messages: Anthropic.Messages.MessageParam[],
  model: string,
): Promise<string> {
  let response: Anthropic.Messages.Message;

  do {
    response = await agent.messages.create({
      model,
      max_tokens: 1024,
      tools: getToolDefinitions(),
      messages,
    });

    messages.push({
      role: "assistant",
      content: response.content,
    });

    if (response.stop_reason === "tool_use") {
      const toolResults = await buildToolResults(response);
      messages.push({
        role: "user",
        content: toolResults,
      });
    }
  } while (response.stop_reason === "tool_use");

  return (
    response.content
      .filter((contentBlock) => contentBlock.type === "text")
      .map((contentBlock) => contentBlock.text)
      .join("\n")
      .trim() || "(No text response)"
  );
}
