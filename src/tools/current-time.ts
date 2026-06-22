import type { CustomTool } from "../tools.js";

export const currentTimeTool: CustomTool = {
  definition: {
    name: "current_time",
    description: "Get the current local date and time",
    input_schema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  run: async () => new Date().toLocaleString(),
};
