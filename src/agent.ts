import Anthropic from "@anthropic-ai/sdk";
import { handleToolUse, customToolDefinitions } from "./tools.js";

export async function runAgentTurn(
  agent: Anthropic,
  messages: Anthropic.MessageParam[],
  model: string,
) {
  let response: Anthropic.Message;

  const stream = agent.messages
    .stream({
      model,
      max_tokens: 1024,
      tools: customToolDefinitions,
      system: undefined, // TODO Add a system prompt
      messages,
    })
    .on("text", (text) => {
      process.stdout.write(text);
    });

  response = await stream.finalMessage();

  messages.push({
    role: "assistant",
    content: response.content,
  });

  if (response.stop_reason === "tool_use") {
    const toolResults = await handleToolUse(response);
    messages.push({
      role: "user",
      content: toolResults,
    });
  }
}
