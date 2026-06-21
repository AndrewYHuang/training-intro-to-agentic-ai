import Anthropic from '@anthropic-ai/sdk';
import { Command } from 'commander';

const program = new Command();

program
  .name('claude-cli')
  .description('Send a prompt to the Anthropic Messages API')
  .argument('<message>', 'message to send to Claude')
  .option('-m, --model <model>', 'Anthropic model to use', 'claude-opus-4-6')
  .option('-t, --max-tokens <number>', 'maximum tokens in the response', '1024')
  .action(async (message: string, options: { model: string; maxTokens: string }) => {
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY must be set before running this CLI.');
    }

    const maxTokens = Number.parseInt(options.maxTokens, 10);

    if (!Number.isFinite(maxTokens) || maxTokens <= 0) {
      throw new Error('--max-tokens must be a positive integer.');
    }

    const client = new Anthropic({ apiKey });
    const response = await client.messages.create({
      model: options.model,
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: message }],
    });

    const output = response.content
      .filter((block) => block.type === 'text')
      .map((block) => block.text)
      .join('\n\n')
      .trim();

    if (!output) {
      throw new Error('Claude returned no text content.');
    }

    console.log(output);
  });

program.parseAsync(process.argv).catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'Unknown error';
  console.error(message);
  process.exitCode = 1;
});
