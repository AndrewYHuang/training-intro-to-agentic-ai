# Intro to Agentic AI

## Overview

This is an introductory lesson to Agentic AI.

The [presentation](./docs/slides.p.md) covers the main theory behind how Agentic AI works.

The [exercise](./EXERCISE.md) will lead you through augmenting an LLM-powered chat with tool use.

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
