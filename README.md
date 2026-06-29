# Intro to Agentic AI

## Overview

This is an introductory lesson to Agentic AI.

The [presentation](./docs/slides.p.md) covers the main theory behind how Agentic AI works.

The [exercise](./EXERCISE.md) will lead you through augmenting an LLM-powered chat with tool use.

> [!NOTE]
>
> This repo uses the [Anthropic SDK](https://platform.claude.com/docs/en/cli-sdks-libraries/sdks/typescript) to interact with the Messages API more directly, to demonstrate the agentic flow.
> 
> If I were planning to implement for real, I would consider using the [Agent SDK](https://code.claude.com/docs/en/agent-sdk/overview) instead, as it handles the agentic flow so we don't have to.

## Set-up and Prerequisites

### Dependencies

You will need:

- A clone of this repo
- Node.js (and npm)
- An Anthropic API key
- A recipeapi.io API key (for an exercise task)

### Quick start

Set up the project and environment variables:

```bash
npm install
cp .env.example .env
# Edit .env and set your real ANTHROPIC_API_KEY and RECIPEAPI_API_KEY
# Optional: set ANTHROPIC_MODEL (defaults to claude-haiku-4-5)
```

Run the CLI:

```bash
npm run dev
```
