const OpenAI = require("openai");

// `openrouter/free` is OpenRouter's supported free-model router. It selects an
// available model that supports the chat-completions request at call time.
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || "openrouter/free";

const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "X-Title": "CareerPilot AI",
  },
});

// Keep exporting the OpenAI client directly because other AI modules consume
// this configuration. The interview module reads these settings from it.
client.OPENROUTER_MODEL = OPENROUTER_MODEL;
client.OPENROUTER_FREE_MODEL = "openrouter/free";

module.exports = client;
