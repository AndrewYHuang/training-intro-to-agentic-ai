import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { createAgent, runAgentTurn } from "./agent.js";

export async function startChat() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("Missing ANTHROPIC_API_KEY environment variable.");
  }

  const agent = createAgent(apiKey);
  const rl = createInterface({ input, output });

  console.log("CLI Agent (Claude Messages API tool use)");
  console.log('Type "exit" to quit.');
  console.log('Try: "What time is it?" or "Search the web for github copilot"');

  while (true) {
    const userInput = (await rl.question("you> ")).trim();
    if (userInput.toLowerCase() === "exit") {
      break;
    }

    const finalReply = await runAgentTurn(agent, userInput);
    console.log(`assistant> ${finalReply}`);
  }

  rl.close();
  console.log("Bye!");
}
