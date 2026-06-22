import "dotenv/config";
import { Command } from "commander";
import Anthropic from "@anthropic-ai/sdk";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

type ToolName = "current_time" | "web_search";

type ToolDefinition = Anthropic.Tool;

type LocalTool = {
  definition: ToolDefinition;
  run: (args: Record<string, unknown>) => Promise<string>;
};

const tools: Record<ToolName, LocalTool> = {
  current_time: {
    definition: {
      name: "current_time",
      description: "Get the current local date and time",
      input_schema: {
        type: "object",
        properties: {},
        required: [],
      },
    },
    run: async () => new Date().toLocaleString(),
  },
  web_search: {
    definition: {
      name: "web_search",
      description: "Search the web and return a concise result summary",
      input_schema: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Search query string",
          },
        },
        required: ["query"],
      },
    },
    run: async (args) => {
      const query = String(args.query ?? "").trim();
      if (!query) {
        return "No search query provided.";
      }

      const searchBaseUrl = "https://api.duckduckgo.com/";
      const searchParams = new URLSearchParams({
        q: query,
        format: "json",
        no_redirect: "1",
        no_html: "1",
      });
      const url = `${searchBaseUrl}?${searchParams.toString()}`;
      const response = await fetch(url);
      if (!response.ok) {
        return `Search failed with status ${response.status}.`;
      }

      const data = (await response.json()) as {
        Answer?: string;
        AbstractText?: string;
        Heading?: string;
        RelatedTopics?: Array<{ Text?: string }>;
      };

      const summary =
        data.Answer ||
        data.AbstractText ||
        data.RelatedTopics?.find((topic) => topic.Text)?.Text ||
        "No useful result found.";
      const heading = data.Heading ? `${data.Heading}: ` : "";
      return `${heading}${summary}`;
    },
  },
};

function getToolDefinitions(): ToolDefinition[] {
  return Object.values(tools).map((tool) => tool.definition);
}

async function runTool(
  toolName: ToolName,
  args: Record<string, unknown>,
): Promise<string> {
  return tools[toolName].run(args);
}

function isToolName(value: string): value is ToolName {
  return value in tools;
}

async function getAssistantResponse(
  anthropic: Anthropic,
  messages: Anthropic.Messages.MessageParam[],
): Promise<string> {
  let response = await anthropic.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 1024,
    tools: getToolDefinitions(),
    messages,
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

    messages.push({
      role: "assistant",
      content: response.content,
    });
    messages.push({
      role: "user",
      content: toolResults,
    });

    response = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 1024,
      tools: getToolDefinitions(),
      messages,
    });
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

async function startChat() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("Missing ANTHROPIC_API_KEY environment variable.");
  }

  const anthropic = new Anthropic({ apiKey });
  const rl = createInterface({ input, output });
  const messages: Anthropic.Messages.MessageParam[] = [];

  console.log("CLI Agent (Claude Messages API tool use)");
  console.log('Type "exit" to quit.');
  console.log('Try: "What time is it?" or "Search the web for github copilot"');

  while (true) {
    const userInput = (await rl.question("you> ")).trim();
    if (userInput.toLowerCase() === "exit") {
      break;
    }

    messages.push({ role: "user", content: userInput });
    const finalReply = await getAssistantResponse(anthropic, messages);
    console.log(`assistant> ${finalReply}`);
  }

  rl.close();
  console.log("Bye!");
}

const program = new Command();
program
  .name("agent-chat")
  .description("Interactive CLI agent chat tool with basic tool use")
  .action(async () => {
    await startChat();
  });

async function main() {
  await program.parseAsync(process.argv);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
