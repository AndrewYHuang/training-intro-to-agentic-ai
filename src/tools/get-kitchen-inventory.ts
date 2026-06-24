import Anthropic from "@anthropic-ai/sdk";

const kitchenInventory = {
  items: [
    "mushrooms",
    "flour",
    "sugar",
    "eggs",
    "milk",
    "butter",
    "salt",
    "pepper",
    "garlic",
    "onions",
    "tomatoes",
    "cheese",
    "pasta",
    "rice",
    "beans",
    "chicken",
    "beef",
    "fish",
    "carrots",
    "potatoes",
    "spinach",
    "broccoli",
    "bell peppers",
    "cucumber",
    "lemon",
    "lime",
    "olive oil",
    "vinegar",
    "soy sauce",
    "honey",
    "vanilla extract",
  ],
};

export const getKitchenInventoryToolDefinition: Anthropic.Tool = {
  name: "get_kitchen_inventory",
  description:
    "Lists the current kitchen inventory of ingredients available for cooking.",
  input_schema: {
    type: "object",
    properties: {},
    required: [],
  },
};

export async function getKitchenInventory() {
  return JSON.stringify(kitchenInventory.items, null, 2);
}
