import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { runAgentTurn } from "./agent.js";
import { getAnthropicConfig } from "./config.js";
import Anthropic from "@anthropic-ai/sdk";
import "dotenv/config";

async function startChat() {
  const { apiKey, model, baseURL } = getAnthropicConfig();

  const agent = new Anthropic({ apiKey, ...(baseURL ? { baseURL } : {}) });

  const messageHistory: Anthropic.MessageParam[] = [];
  const rl = createInterface({ input, output });

  console.log("Welcome to RecipeMate");
  console.log('Type "/exit" to quit.');
  console.log('Try: "What time is it?" or "Give me a recipe for wonton soup"');

  while (true) {
    const userInput = (await rl.question("> ")).trim();
    if (userInput.toLowerCase() === "/exit") {
      break;
    }

    messageHistory.push({ role: "user", content: userInput });

    console.log();
    await runAgentTurn(agent, messageHistory, model);
    console.log("\n");
  }

  rl.close();
  console.log("Bye!");
}

await startChat();
