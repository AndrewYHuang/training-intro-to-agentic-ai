import "dotenv/config";
import { Command } from "commander";
import { startChat } from "./chat.js";

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
