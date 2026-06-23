# Exercise: RecipeMate

You've been tasked to make an AI powered recipe assistant called RecipeMate. The goal of this tool is to help users find recipes based on ingredients they have on hand, scale up or down recipes based on the number of servings they want, and provide step-by-step cooking instructions.

The codebase has been left in a bit of a half-finished state, and your job is to complete its implementation.

## Getting started

Please follow the set-up instructions in the [README](./README.md) to get the project running locally.

## Project overview

### Structure

`src/app.ts` - The main entry-point of the application. This immediately starts the chat loop.

`src/agent.ts` - This is where the agent loop is implemented. The agent loop is responsible for sending user input to the LLM, and handling the LLM's response to tool calls.

`src/tools.ts` - This is where all the tools are listed and where messages for tool use are handled

`src/tools/` - This folder is where we define all our tools and implement their functionality. Each tool is defined in its own file.

## Tasks

### Handle tool use

For some strange reason, the previous developer included a tool to get the current time. Luckily for us, this is useful to check if the LLM is able to use tools.

You may have noticed that if you ask the AI for the time, it says that it's unable to tell us.

This is because we need to do a couple of things to make sure the LLM can use a tool.

1. Tell the LLM that the tool exists and how to use it.
2. Invoke the tool when the LLM asks for it.

### Add recipe search

RecipeAPI.io is a free API that allows you to search for recipes based on ingredients. You will need to implement a way for the LLM to call this API and retrieve recipes based on the user's input.

Inside `src/tools/`

### Set up the agent loop

While stop reason is not end_turn

## Optional Tasks

### Try a different model

The application defaults to `claude-haiku-4-5`, but you can try `claude-sonnet-4-6` or a different model. Set the `ANTHROPIC_MODEL` environment variable to the model you want to use.

### Add a system prompt

### Calculator

### Persist memory to disk
