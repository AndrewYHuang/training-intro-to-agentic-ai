import type { LocalTool } from "./index.js";

export const webSearchTool: LocalTool = {
  definition: {
    name: "web_search",
    description: "Search the web and return a concise result summary",
    input_schema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search query string",
        },
      },
      required: ["query"],
    },
  },
  run: async (args) => {
    const query = String(args.query ?? "").trim();
    if (!query) {
      return "No search query provided.";
    }

    const searchBaseUrl = "https://api.duckduckgo.com/";
    const searchParams = new URLSearchParams({
      q: query,
      format: "json",
      no_redirect: "1",
      no_html: "1",
    });
    const url = `${searchBaseUrl}?${searchParams.toString()}`;
    const response = await fetch(url);
    if (!response.ok) {
      return `Search failed with status ${response.status}.`;
    }

    const data = (await response.json()) as {
      Answer?: string;
      AbstractText?: string;
      Heading?: string;
      RelatedTopics?: Array<{ Text?: string }>;
    };

    const summary =
      data.Answer ||
      data.AbstractText ||
      data.RelatedTopics?.find((topic) => topic.Text)?.Text ||
      "No useful result found.";
    const heading = data.Heading ? `${data.Heading}: ` : "";
    return `${heading}${summary}`;
  },
};
