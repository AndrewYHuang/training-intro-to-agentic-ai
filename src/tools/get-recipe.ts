import Anthropic from "@anthropic-ai/sdk";
import { getRecipeAPIConfig } from "../config.js";

type GetRecipeArgs = {
  id?: string;
};

type RecipeAPIRecipeResponse = {
  data?: {
    id?: string;
    name?: string;
    description?: string;
    ingredients?: Array<{
      name?: string;
      amount?: number;
      unit?: string;
      notes?: string;
    }>;
    instructions?: string[] | string;
    cuisine?: string;
    meal_type?: string;
    difficulty?: string;
    prep_time?: number;
    cook_time?: number;
    servings?: number;
    dietary_tags?: string[];
  };
  error?: {
    code?: string;
    message?: string;
  };
};

export const getRecipeToolDefinition: Anthropic.Tool = {
  name: "get_recipe",
  description: "Get full recipe details by recipe id.",
  input_schema: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "The recipe id returned from find_recipes.",
      },
    },
    required: ["id"],
  },
};

function getString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function formatRecipe(recipe: NonNullable<RecipeAPIRecipeResponse["data"]>) {
  return JSON.stringify(
    {
      id: recipe.id,
      name: recipe.name,
      description: recipe.description,
      ingredients: recipe.ingredients,
      instructions: recipe.instructions,
      cuisine: recipe.cuisine,
      mealType: recipe.meal_type,
      difficulty: recipe.difficulty,
      prepTimeMinutes: recipe.prep_time,
      cookTimeMinutes: recipe.cook_time,
      servings: recipe.servings,
      dietaryTags: recipe.dietary_tags,
    },
    null,
    2,
  );
}

export async function getRecipe(args: Record<string, unknown>) {
  const apiKey = getRecipeAPIConfig();
  if (!apiKey) {
    return "Recipe API is unavailable because RECIPEAPI_API_KEY is not configured.";
  }

  const { id }: GetRecipeArgs = {
    id: getString(args.id),
  };

  if (!id) {
    return "Provide a recipe id.";
  }

  try {
    const response = await fetch(`https://recipeapi.io/api/v1/recipes/${id}`, {
      headers: {
        "X-API-Key": apiKey,
      },
    });

    const body = (await response.json()) as RecipeAPIRecipeResponse;

    if (!response.ok) {
      return (
        body.error?.message ??
        `Recipe API request failed with status ${response.status}.`
      );
    }

    if (!body.data) {
      return "Recipe not found.";
    }

    return formatRecipe(body.data);
  } catch (error) {
    if (error instanceof Error) {
      return `Recipe API request failed: ${error.message}`;
    }

    return "Recipe API request failed.";
  }
}
