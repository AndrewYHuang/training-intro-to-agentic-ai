# training-intro-to-agentic-ai

## 45-minute intro exercise: build a CLI agent with tools

### Objective (2 min)
- Build a basic interactive CLI chat agent that can use simple tools.
- Success criteria: one end-to-end chat where the agent calls a tool and returns the result.

---

### Milestone 1: CLI scaffold (8 min)
1. Open `/home/runner/work/training-intro-to-agentic-ai/training-intro-to-agentic-ai/src/index.ts`.
2. Create a runnable CLI entrypoint.
3. Add an input loop that accepts user messages.
4. Confirm it works with:
   ```bash
   npm run dev
   ```
5. Type a message and verify you get a placeholder assistant response.

---

### Milestone 2: Basic chat integration (12 min)
1. Keep a simple user → assistant loop.
2. Continue until the user types `exit`.
3. Keep this stage simple: message in, response out, repeat.

---

### Milestone 3: Add two basic tools (12 min)
1. Add a small tool registry in code.
2. Include two tools:
   - `current_time`: returns current local date/time.
   - `add_numbers`: adds two numbers from a prompt like `add 12 and 30`.
3. Add short descriptions so tool purpose is clear.

---

### Milestone 4: Happy-path tool calling (8 min)
1. Add a simple tool-selection step from user input.
2. Implement this flow:
   - detect tool request
   - execute tool
   - send tool result back into assistant response
3. Validate with scripted prompts:
   - `What time is it?`
   - `add 12 and 30`

---

### Wrap-up and demo (3 min)
1. Run the app and demo one full conversation.
2. Show at least one successful tool call.
3. Recap what was built and what can be extended next (more tools, real LLM API, conversation memory).

---

### Constraints
- Happy path only (no failure/debug scenarios).
- Prioritize confidence and momentum.
- Keep steps highly guided and incremental.

## Quick start

```bash
npm install
npm run dev
```