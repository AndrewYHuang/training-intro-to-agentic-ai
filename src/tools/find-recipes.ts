import Anthropic from "@anthropic-ai/sdk";
import { getRecipeAPIConfig } from "../config.js";

type FindRecipesArgs = {
  search?: string;
  ingredients?: string[];
  cuisine?: string;
  meal_type?: string;
  difficulty?: string;
  dietary_tags?: string;
  maxResults?: number;
};

type RecipeAPIRecipe = {
  name: string;
  description?: string;
  cuisine?: string;
  meal_type?: string;
  difficulty?: string;
  prep_time?: number;
  cook_time?: number;
  dietary_tags?: string[];
};

type RecipeAPISearchResponse = {
  data?: RecipeAPIRecipe[];
  error?: {
    code?: string;
    message?: string;
  };
};

export const findRecipesToolDefinition: Anthropic.Tool = {
  name: "find_recipes",
  description:
    "Search for recipes by name, ingredients, cuisine, meal type, difficulty, or dietary tag.",
  input_schema: {
    type: "object",
    properties: {
      search: {
        type: "string",
        description: "Recipe name or general search phrase.",
      },
      ingredients: {
        type: "array",
        items: { type: "string" },
        description: "Ingredients to match in the recipe.",
      },
      cuisine: {
        type: "string",
        description: "Cuisine to filter by, such as italian or mexican.",
      },
      meal_type: {
        type: "string",
        description: "Meal type to filter by, such as main or dessert.",
      },
      difficulty: {
        type: "string",
        description: "Difficulty to filter by, such as easy, medium, or hard.",
      },
      dietary_tags: {
        type: "string",
        description: "A dietary tag to filter by, such as vegetarian or vegan.",
      },
      maxResults: {
        type: "integer",
        description: "Maximum number of recipes to return. Defaults to 5.",
        minimum: 1,
        maximum: 10,
      },
    },
    required: [],
  },
};

function getString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function getStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const items = value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);

  return items.length > 0 ? items : undefined;
}

function getMaxResults(value: unknown) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return 5;
  }

  return Math.min(10, Math.max(1, Math.trunc(value)));
}

function formatRecipes(recipes: RecipeAPIRecipe[]) {
  return JSON.stringify(
    recipes.map((recipe) => ({
      name: recipe.name,
      description: recipe.description,
      cuisine: recipe.cuisine,
      mealType: recipe.meal_type,
      difficulty: recipe.difficulty,
      prepTimeMinutes: recipe.prep_time,
      cookTimeMinutes: recipe.cook_time,
      dietaryTags: recipe.dietary_tags,
    })),
    null,
    2,
  );
}

export async function findRecipes(args: Record<string, unknown>) {
  const apiKey = getRecipeAPIConfig();
  if (!apiKey) {
    return "Recipe API is unavailable because RECIPEAPI_API_KEY is not configured.";
  }

  const {
    search,
    ingredients,
    cuisine,
    meal_type,
    difficulty,
    dietary_tags,
    maxResults,
  }: FindRecipesArgs = {
    search: getString(args.search),
    ingredients: getStringArray(args.ingredients),
    cuisine: getString(args.cuisine),
    meal_type: getString(args.meal_type),
    difficulty: getString(args.difficulty),
    dietary_tags: getString(args.dietary_tags),
    maxResults: getMaxResults(args.maxResults),
  };

  const params = new URLSearchParams({
    per_page: String(maxResults ?? 5),
  });

  if (search) {
    params.set("search", search);
  }
  if (ingredients) {
    params.set("ingredients", ingredients.join(","));
  }
  if (cuisine) {
    params.set("cuisine", cuisine);
  }
  if (meal_type) {
    params.set("meal_type", meal_type);
  }
  if (difficulty) {
    params.set("difficulty", difficulty);
  }
  if (dietary_tags) {
    params.set("dietary_tags", dietary_tags);
  }

  if (params.size === 1) {
    return "Provide at least a recipe search term, ingredients, or another recipe filter.";
  }

  try {
    const response = await fetch(
      `https://recipeapi.io/api/v1/recipes?${params.toString()}`,
      {
        headers: {
          "X-API-Key": apiKey,
        },
      },
    );

    const body = (await response.json()) as RecipeAPISearchResponse;

    if (!response.ok) {
      return (
        body.error?.message ??
        `Recipe API request failed with status ${response.status}.`
      );
    }

    if (!body.data?.length) {
      return "No recipes found for that search.";
    }

    return formatRecipes(body.data);
  } catch (error) {
    if (error instanceof Error) {
      return `Recipe API request failed: ${error.message}`;
    }

    return "Recipe API request failed.";
  }
}
