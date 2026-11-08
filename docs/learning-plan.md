# Learning AI Agents with Google ADK (free Gemini API)

A step-by-step plan for learning how AI agents work. You build one small agent per step, and in the final step you combine them into a **Study Helper** agent.

- **Stack:** `@google/adk` (TypeScript), with the `adk` CLI from `@google/adk-devtools`
- **Model:** `gemini-3.5-flash-lite`, which has the most generous free-tier limits
- **Format:** each step is its own folder containing an `agent.ts`. `npx adk web` finds every such folder, so you can switch between steps in the dev UI dropdown.

---

## The core idea

```
Agent = LLM (brain) + Instructions (goal/persona) + Tools (actions) + Memory (state) + Loop
```

The agent loop works like this:

1. **Think:** the model reads the instruction, the conversation and the available tools.
2. **Act:** the model either answers directly or asks to call a tool.
3. **Observe:** ADK runs the tool and feeds the result back to the model.
4. Steps 1–3 repeat until the model gives a final answer.

---

## Step 0 — Setup (one time)

- [ ] Create a free API key at https://aistudio.google.com/apikey
- [ ] Put it in `.env` at the repo root (`.env` is already git-ignored):
  ```
  GOOGLE_API_KEY=your_key_here
  ```
- [ ] Run `npm install zod`. Tools use Zod schemas to describe their inputs.
- [ ] Check that the starter agent works:
  ```
  npx adk web
  ```
  Open http://localhost:8000, pick `agent` and say hi.

> **Tip:** a `429` error means you hit the free-tier rate limit. Wait a minute and try again.
>
> **Note:** `gemini-2.5-flash-lite` returns `404 ... no longer available to new users` for new API keys, so these lessons use `gemini-3.5-flash-lite`.

---

## Step 1 — Your first agent (`lesson01_hello/`)

**Learn:** what an agent is, and the basic fields: `name`, `description`, `model`, `instruction`.

**Build:** an `LlmAgent` with a friendly tutor persona and no tools.

**Try:**
- "Explain what an API is."
- "Explain it again like I'm 10."

**Exercise:** change the `instruction` to a different persona, such as a strict teacher or a pirate, and compare the answers.

- [x] Built
- [ ] Exercise done

---

## Step 2 — Tools / function calling (`lesson02_tools/`)

**Learn:** the model decides when to call **your code**, reads the result, and then answers. The tool's `description` is how the model knows when to use it.

**Build:** `FunctionTool`s with Zod `parameters`:
- `get_current_time`
- `calculate`
- `count_words`

**Try:**
- "What is 17 * 23?"
- "What time is it?"

Open the **Trace/Events** tab in adk web to see each tool call and its result.

**Exercise:** add a `convert_units` tool, for example km ↔ miles.

- [ ] Done

---

## Step 3 — Built-in tools & agent-as-a-tool (`lesson03_search/`)

**Learn:** built-in tools vs. custom tools. Gemini's built-in `GOOGLE_SEARCH` can't be mixed with function tools in the same agent. The fix is to put search in its own agent and wrap that agent as a tool.

**Build:**
- A `search_agent` that has `GOOGLE_SEARCH`.
- A main agent that uses `new AgentTool({ agent: searchAgent })` alongside a custom tool.

**Try:**
- "What's the latest version of Node.js?"
- "How many days until New Year?"

**Exercise:** write a `news_agent` and wrap it as a tool the same way.

- [ ] Done

---

## Step 4 — Sessions & state, i.e. short-term memory (`lesson04_state/`)

**Learn:**
- A **session** is one conversation.
- **State** is a key/value store attached to that session.
- Tools read and write it through `toolContext.state`.
- Instructions can read it with `{key}` templating.

**Build:**
- `save_note` and `list_notes` tools.
- A `topics_learned` counter that persists across turns.

**Try:**
- "Save a note: closures capture variables."
- A few turns later: "What notes do I have?"

**Exercise:** add a `delete_note` tool.

- [ ] Done

---

## Step 5 — Multi-agent systems (`lesson05_multi_agent/`)

**Learn:** two ways to combine agents.
- **Coordinator + `subAgents`:** the LLM decides which agent handles each request (agent transfer).
- **`SequentialAgent`:** a fixed pipeline. Each step saves its result with `outputKey`, and the next step reads it.

**Build:**
- A coordinator that routes to an `explainer` and a `quizzer`.
- A `researcher → summarizer` sequential pipeline.

**Try:**
- "Explain recursion."
- "Now quiz me on it."

Watch the agent transfers in the Trace tab.

**Exercise:** add a third sub-agent, such as `code_reviewer`.

- [ ] Done

---

## Step 6 — Structured output (`lesson06_structured/`)

**Learn:** `outputSchema` (a Zod schema) makes the model return JSON in a fixed shape that your code can trust.

**Build:** a quiz generator that returns:
```json
{ "question": "...", "options": ["..."], "answer": "...", "explanation": "..." }
```

**Try:** "Make a quiz question about JavaScript promises."

**Exercise:** add a `difficulty` field (`easy` | `medium` | `hard`).

- [ ] Done

---

## Step 7 — Capstone: Study Helper (`study_helper/`)

This step puts everything from Steps 1–6 together.

| Part | What it does | From step |
|------|--------------|-----------|
| `study_helper` (root/coordinator) | Greets you, asks what you want to study, and routes requests | 1, 5 |
| `AgentTool(search_agent)` | Looks up current facts | 3 |
| `explainer` sub-agent | Explains topics simply, with examples | 5 |
| `quiz_master` sub-agent | Asks one question at a time and checks your answer | 5, 6 |
| `record_progress` / `get_progress` tools | Save topics and quiz scores to state, and report them back | 2, 4 |
| Instruction with `{topics_studied?}` | The agent knows what you have already covered | 4 |

**Try:**
1. "I want to learn about HTTP."
2. "Quiz me."
3. Answer the questions.
4. "How am I doing?"

- [ ] Done

---

## How to run any step

```bash
# Dev UI: chat, trace, events, state (recommended)
npx adk web

# Terminal chat for one agent
npx adk run lesson01_hello/agent.ts
```

The repo path contains spaces, so quote it if you `cd` into it from another directory.

---

## Resources

- ADK docs: https://google.github.io/adk-docs/ (read *Agents*, *Tools*, *Sessions & State*, *Multi-agent*)
- Gemini function calling: https://ai.google.dev/gemini-api/docs/function-calling
- Gemini API free tier & rate limits: https://ai.google.dev/gemini-api/docs/rate-limits

## After the capstone (optional)

- Long-term memory across sessions
- MCP tools (`MCPToolset`): connect agents to external tool servers
- Evaluations (`adk eval`): test that your agent behaves correctly
- Serving the agent as an API (`npx adk api_server`)
