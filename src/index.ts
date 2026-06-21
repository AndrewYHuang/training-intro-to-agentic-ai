import { Command } from "commander";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

type ToolName = "current_time" | "add_numbers";

type ToolCall = {
  name: ToolName;
  args: Record<string, string | number>;
};

type ToolDefinition = {
  name: ToolName;
  description: string;
  run: (args: Record<string, string | number>) => string;
};

const tools: Record<ToolName, ToolDefinition> = {
  current_time: {
    name: "current_time",
    description: "Get the current local date and time",
    run: () => new Date().toLocaleString(),
  },
  add_numbers: {
    name: "add_numbers",
    description: "Add two numbers",
    run: (args) => {
      const a = Number(args.a);
      const b = Number(args.b);
      return `${a + b}`;
    },
  },
};

function pickTool(userInput: string): ToolCall | null {
  const normalized = userInput.toLowerCase();

  if (
    normalized.includes("time") ||
    normalized.includes("clock") ||
    normalized.includes("date")
  ) {
    return { name: "current_time", args: {} };
  }

  const addMatch = userInput.match(/add\s+(-?\d+(?:\.\d+)?)\s+and\s+(-?\d+(?:\.\d+)?)/i);
  if (addMatch) {
    return {
      name: "add_numbers",
      args: {
        a: Number(addMatch[1]),
        b: Number(addMatch[2]),
      },
    };
  }

  return null;
}

function respondWithoutTool(userInput: string): string {
  return `I can help with that. I currently support two tools: current time and simple addition. Try: "What time is it?" or "add 12 and 30". You said: "${userInput}"`;
}

function respondWithToolResult(userInput: string, toolCall: ToolCall, toolResult: string): string {
  if (toolCall.name === "current_time") {
    return `The current local time is ${toolResult}.`;
  }

  if (toolCall.name === "add_numbers") {
    return `The result is ${toolResult}.`;
  }

  return `Tool result for "${userInput}": ${toolResult}`;
}

async function startChat() {
  const rl = createInterface({ input, output });

  console.log("CLI Agent (happy path)");
  console.log('Type "exit" to quit.');
  console.log('Try: "What time is it?" or "add 12 and 30"');

  while (true) {
    const userInput = (await rl.question("you> ")).trim();
    if (userInput.toLowerCase() === "exit") {
      break;
    }

    const toolCall = pickTool(userInput);

    if (!toolCall) {
      console.log(`assistant> ${respondWithoutTool(userInput)}`);
      continue;
    }

    const tool = tools[toolCall.name];
    const toolResult = tool.run(toolCall.args);
    const finalReply = respondWithToolResult(userInput, toolCall, toolResult);
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
