import Anthropic from "@anthropic-ai/sdk";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { getAssistantResponse } from "./tools.js";

export async function startChat() {
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
