import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { runAgentTurn } from "./agent.js";
import { getAnthropicConfig } from "./config.js";
import Anthropic from "@anthropic-ai/sdk";

export async function startChat() {
  const { apiKey, model } = getAnthropicConfig();

  const agent = new Anthropic({ apiKey });
  const messages = [] as Anthropic.Messages.MessageParam[];
  const rl = createInterface({ input, output });

  console.log("CLI Agent (Claude Messages API tool use)");
  console.log('Type "/exit" to quit.');
  console.log('Try: "What time is it?" or "Search the web for github copilot"');

  while (true) {
    const userInput = (await rl.question("> ")).trim();
    if (userInput.toLowerCase() === "/exit") {
      break;
    }
    messages.push({ role: "user", content: userInput });
    await runAgentTurn(agent, messages, model);
    console.log("\n");
  }

  rl.close();
  console.log("Bye!");
}
