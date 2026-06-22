import type { LocalTool } from "../tools.js";

export const currentTimeTool: LocalTool = {
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
