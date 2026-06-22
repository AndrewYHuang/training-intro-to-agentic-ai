import Anthropic from "@anthropic-ai/sdk";
import { invokeTool, getToolDefinitions } from "./customTool.js";

export async function runAgentTurn(
  agent: Anthropic,
  messages: Anthropic.MessageParam[],
  model: string,
) {
  let response: Anthropic.Message;

  do {
    const stream = agent.messages
      .stream({
        model,
        max_tokens: 1024,
        tools: [
          { type: "web_search_20260209", name: "web_search" },
          ...getToolDefinitions(),
        ],
        messages,
      })
      .on("contentBlock", (contentBlock) => {
        if (contentBlock.type === "server_tool_use") {
          console.log(`Server tool use: ${contentBlock.name}`)
        }
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
      const toolResults = await invokeTool(response);
      messages.push({
        role: "user",
        content: toolResults,
      });
    }
  } while (response.stop_reason === "tool_use");
}
