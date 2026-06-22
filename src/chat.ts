import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { runAgentTurn } from "./agent.js";
import Anthropic from "@anthropic-ai/sdk";

export async function startChat() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("Missing ANTHROPIC_API_KEY environment variable.");
  }
  const model = process.env.ANTHROPIC_MODEL ?? "claude-sonnett-4-6";

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
    await runAgentTurn(agent, messages, userInput, model);
  }

  rl.close();
  console.log("Bye!");
}
