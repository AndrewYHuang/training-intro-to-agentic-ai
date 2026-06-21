# training-intro-to-agentic-ai

Basic TypeScript CLI for sending a message to the Anthropic API with `commander` and the Claude SDK.

## Setup

```bash
npm install
export ANTHROPIC_API_KEY=your_api_key_here
```

## Usage

```bash
npm start -- "Write a haiku about agentic AI"
```

Optional flags:

- `--model <model>` to choose the Anthropic model
- `--max-tokens <number>` to control the maximum response length

Example:

```bash
npm start -- "Explain tool calling" --model claude-opus-4-6 --max-tokens 256
```