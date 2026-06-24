# Exercise: RecipeMate

You've been tasked to make an AI powered recipe assistant called RecipeMate. The goal of this tool is to help users find recipes based on ingredients they have on hand, scale up or down recipes based on the number of servings they want, and provide step-by-step cooking instructions.

The codebase has been left in a bit of a half-finished state, and your job is to complete its implementation.

## Getting started

Please follow the set-up instructions in the [README](./README.md) to get the project running locally.

## Project overview

`src/app.ts` - The main entry-point of the application. This immediately starts the chat loop. The user and agent take "turns", which is the motivation behind the name of the function `runAgentTurn`, defined in `agent.ts`.

`src/agent.ts` - This is where the agent loop is implemented. The agent loop is responsible for sending user input to the LLM (in the form of `messages`), and handling the LLM's responses.

`src/tools.ts` - This is where all the tools are listed and where tool use is handled.

`src/tools/` - This folder is where we define all our tools and implement their functionality. Each tool is defined in its own file.

`src/tools/find-recipes.ts` - This is a fully implemented tool that allows the LLM to search for recipes based on a list of ingredients. It uses the RecipeAPI.io API to find recipes.

`src/tools/get-current-time.ts` - This is also fully implemented. It gets the current time.

`src/tools/get-kitchen-inventory.ts` - This is incomplete - to be completed as part of the tasks below

## Tasks

### Handle tool use

For some strange reason, the previous developer included a tool to get the current time (in addition to finding recipes). Luckily for us, this is useful to check if the LLM is able to use tools.

You may have noticed that if you ask the AI for the time, it says that it's unable to tell us.

This is because we need to do a couple of things to make sure the LLM can use a tool.

1. Tell the LLM that the tool exists and how to use it.
2. Invoke the tool when the LLM asks for it.

#### Send a list of available tools to the LLM

The list of available tools is defined in `tools.ts` as `customToolDefinitions`. It's formatted in the right way for the LLM to understand, but we need to make sure that the LLM is aware of it.

The `messages.stream` API call is where the LLM is called, and it takes a `tools` property that can be used to send a list of available tools to the LLM.

<details>

<summary>Hint</summary>

We need to pass `customToolDefinitions` to the `tools` property of the `messages.stream` call in `agent.ts`. The code should look like this:

```typescript
const stream = agent.messages.stream({
  model,
  max_tokens: 1024,
  tools: customToolDefinitions,
  system: undefined, // TODO Add a system prompt
  messages,
});
```

</details>

#### Invoke tools when the LLM requests them

When the LLM wants to use a tool, it will tell us by returning a response with `stop_reason = "tool_use"`. We need to check for this type of message and handle it.

We already have function called `handleToolUse` in `tools.ts` that takes care of this for us. We just need to call it when we see a message with `stop_reason: "tool_use"`.

<details>

<summary>Hint</summary>

```typescript
if (response.stop_reason === "tool_use") {
  const toolResults = await handleToolUse(response);
  messages.push({
    role: "user",
    content: toolResults,
  });
}
```

</details>

There are [many more values](https://platform.claude.com/docs/en/build-with-claude/handling-stop-reasons) that the `stop_reason` field can take, but for this exercise we only need to handle `tool_use` and `end_turn`.

### Get available ingredients

The kitchen inventory is stored as an object in `src/tools/get-kitchen-inventory.ts`. The LLM should be able to ask for a list of available ingredients, and the tool should return them.

Add `get_kitchen_inventory` to the tool list, and return the list of ingredients when the LLM calls it.

### Set up the agent loop

This is where our tool becomes truly _agentic_.

The agent can use a tool once per turn, but it can't chain tool calls together. For example, if the user asks for a recipe based on the available ingredients in our kitchen, the agent can call the recipe search tool _or_ the list ingredients tool, but not both, one after the other.

The correct way to handle this is to have the scaffold loop back to the LLM after each tool call.

Wrap the body of the `runAgentTurn` function in a loop that handles the `stop_reason` correctly. Assume that `stop_reason` will only either be `tool_use` or `end_turn`.

<details>
<summary>Hint</summary>

```typescript
export async function runAgentTurn(
  agent: Anthropic,
  messages: Anthropic.MessageParam[],
  model: string,
) {
  let response: Anthropic.Message;

  do {
    const stream = agent.messages
      .stream({
        model,
        max_tokens: 1024,
        tools: customToolDefinitions,
        system: undefined, // TODO Add a system prompt
        messages,
      })
      .on("text", (text) => {
        process.stdout.write(text);
      });

    response = await stream.finalMessage();

    messages.push({
      role: "assistant",
      content: response.content,
    });

    if (response.stop_reason === "tool_use") {
      const toolResults = await handleToolUse(response);
      messages.push({
        role: "user",
        content: toolResults,
      });
    }
  } while (response.stop_reason === "tool_use");
}
```

</details>

### Get recipe by id

RecipeAPI.io is a free API that allows you to search and retrieve recipes. The previous developer has already implemented a tool that allows the LLM to search for recipes, however, the LLM is unable to retrieve the recipe once it has been found.

Add a way to retrieve a recipe by its id to `get-recipe.ts`, and add it as a tool that the agent can use.

The RecipeAPI.io API has an endpoint for this: `GET /api/v1/recipes/{id}`. You can find the documentation [here](https://recipeapi.io/docs/resources/recipes/#get-recipe).

## Extension Tasks

### More suggestions

#### Try a different model

The application defaults to `claude-haiku-4-5`, but you can try `claude-sonnet-4-6` or a different model. Set the `ANTHROPIC_MODEL` environment variable to the model you want to use.

#### Add a system prompt

Sometimes, a system prompt can help the LLM understand the context of the conversation better. You can add a system prompt to the `messages.stream` call in `agent.ts`.

#### Calculator

A calculator tool could be useful for scaling recipes or converting units. You can implement a simple calculator tool that takes a mathematical expression as input and returns the result.

#### Persist memory to disk

It might be useful to persist the conversation history to disk so that the agent can remember past interactions. You can implement a simple file-based memory system that saves and loads messages from a JSON file.
