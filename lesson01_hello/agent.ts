/**
 * LESSON 1 — Your first agent
 * ===========================
 *
 * An "agent" is an LLM (the brain) that has been given:
 *   1. an identity  -> name + description
 *   2. a brain      -> model
 *   3. a job        -> instruction (also called the "system prompt")
 *   4. (later) tools, memory and other agents to work with
 *
 * This lesson only uses 1–3. The agent has no tools yet, so it can only
 * answer from what the model already knows.
 *
 * Run it:
 *   npx adk web                          -> pick "lesson01_hello" in the dropdown
 *   npx adk run lesson01_hello/agent.ts  -> chat in the terminal
 */

import {LlmAgent} from '@google/adk';

// `LlmAgent` is the basic ADK agent: one LLM plus its configuration.
// ADK's CLI looks for an exported variable named exactly `rootAgent`,
// the entry point of your agent app.
export const rootAgent = new LlmAgent({
  // NAME: a unique id (letters, digits, underscores).
  // In multi-agent systems (Lesson 5), other agents refer to it by this name.
  name: 'friendly_tutor',

  // DESCRIPTION: a one-line summary of what this agent does.
  // The user never sees it. OTHER agents read it to decide whether to
  // hand a task to this one, so write it for them.
  description: 'A patient tutor that explains programming concepts simply.',

  // MODEL: which Gemini model is the "brain".
  // flash-lite is fast, cheap and has the most generous free tier.
  model: 'gemini-3.5-flash-lite',

  // INSTRUCTION: the most important field. ADK sends it to the model as the
  // system prompt on EVERY turn. It sets the persona, the rules and the
  // output style. Changing only this text completely changes the agent.
  instruction: `You are a friendly, patient programming tutor.

Rules:
- Explain concepts in simple words, as if to a beginner.
- Always include one short, real-world analogy.
- Keep answers under 150 words unless the user asks for more detail.
- End each answer with one follow-up question to check understanding.
- If you are not sure about something, say so instead of guessing.`,
});

/**
 * WHAT HAPPENS WHEN YOU SEND A MESSAGE
 * ------------------------------------
 *   you: "What is an API?"
 *     -> ADK builds a request: instruction + conversation history + your message
 *     -> Gemini generates a reply
 *     -> ADK records it as an "event" in the session and shows it to you
 *
 * There are no tools, so the loop runs exactly once per message.
 * In Lesson 2 the model can ask to run code, and the loop starts to matter.
 *
 * EXERCISE
 * --------
 * 1. Ask "What is an API?" and then "Explain it like I'm 10."
 *    The agent remembers the first question because ADK sends the
 *    conversation history (the session) along with every request.
 * 2. Change the instruction to a different persona (a strict professor,
 *    a pirate, an answer-only-in-bullet-points bot) and ask the same thing.
 * 3. Remove the "under 150 words" rule and see how the answers change.
 */
