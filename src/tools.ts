import Anthropic from "@anthropic-ai/sdk";
import {
  findRecipes,
  findRecipesToolDefinition,
} from "./tools/find-recipes.js";
import {
  getCurrentTime,
  getCurrentTimeToolDefinition,
} from "./tools/get-current-time.js";
import {
  getKitchenInventory,
  getKitchenInventoryToolDefinition,
} from "./tools/get-kitchen-inventory.js";
import { getRecipe, getRecipeToolDefinition } from "./tools/get-recipe.js";

export type ToolFunction = (args: Record<string, unknown>) => Promise<string>;

export const customToolDefinitions: Anthropic.Tool[] = [
  getCurrentTimeToolDefinition,
  getKitchenInventoryToolDefinition,
  findRecipesToolDefinition,
  getRecipeToolDefinition,
] as const;

const customTools: Record<string, ToolFunction> = {
  get_current_time: getCurrentTime,
  get_kitchen_inventory: getKitchenInventory,
  find_recipes: findRecipes,
  get_recipe: getRecipe,
} as const;

export async function handleToolUse(
  response: Anthropic.Message,
): Promise<Anthropic.ToolResultBlockParam[]> {
  const toolResults: Anthropic.ToolResultBlockParam[] = [];

  for (const toolUseBlock of response.content.filter(
    (block) => block.type === "tool_use",
  )) {
    const { id: toolUseId, name: toolName, input: args } = toolUseBlock;

    console.log("\n" + "Tool use request: \n" + JSON.stringify(toolUseBlock) + "\n")

    const tool = customTools[toolName];
    const toolResult = await tool(args as Record<string, unknown>);
    toolResults.push({
      type: "tool_result",
      tool_use_id: toolUseId,
      content: toolResult,
    });
  }

  return toolResults;
}
