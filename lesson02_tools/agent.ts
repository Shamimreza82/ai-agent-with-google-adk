/**
 * LESSON 2 — Tools (function calling)
 * ===================================
 *
 * In Lesson 1 the agent could only TALK. Now it can DO things.
 *
 * A "tool" is a normal TypeScript function plus a description the model
 * can read. The model never runs your code itself. It works like this:
 *
 *   you:   "What is 1234 * 5678?"
 *   model: (thinks) "I have a `calculate` tool, so I'll use it"
 *          -> returns a FUNCTION CALL: calculate({operation:'multiply', a:1234, b:5678})
 *   ADK:   runs YOUR function and gets {status:'success', result: 7006652}
 *          -> sends that FUNCTION RESPONSE back to the model
 *   model: "1234 × 5678 = 7,006,652"   <- the final answer
 *
 * This think -> act -> observe -> answer cycle is THE AGENT LOOP.
 * It can repeat several times in a single turn (e.g. two tools in a row).
 *
 * Why use tools at all?
 *   - LLMs are bad at exact maths and don't know the current time.
 *   - Tools give them exact answers, live data, and the ability to act.
 *
 * Run it:
 *   npx adk web  -> pick "lesson02_tools", then open the Events tab to see
 *                   each functionCall / functionResponse.
 */

import {FunctionTool, LlmAgent} from '@google/adk';
import {z} from 'zod';

// ---------------------------------------------------------------------------
// TOOL 1: get_current_time
// ---------------------------------------------------------------------------
// The three things the MODEL sees are: name, description, parameters.
// It never sees the code inside `execute`, so the description must say
// clearly WHAT the tool does and WHEN to use it.
const getCurrentTime = new FunctionTool({
  name: 'get_current_time',
  description:
    'Returns the current date and time in a given IANA timezone. ' +
    'Use this whenever the user asks about the current time or date.',

  // `parameters` is a Zod schema. ADK turns it into a JSON schema for the
  // model AND validates the model's arguments before calling `execute`.
  // `.describe()` text is shown to the model, so use it to explain each arg.
  parameters: z.object({
    timezone: z
      .string()
      .describe('IANA timezone, e.g. "Asia/Dhaka", "Europe/London", "UTC".'),
  }),

  // `execute` is your real code. Its arguments are typed from the schema.
  // Return a plain object: the model reads it as the "function response".
  execute: async ({timezone}) => {
    try {
      const now = new Date().toLocaleString('en-US', {
        timeZone: timezone,
        dateStyle: 'full',
        timeStyle: 'long',
      });
      return {status: 'success', timezone, current_time: now};
    } catch {
      // Good practice: return errors as data instead of throwing, so the
      // model can read the error and recover (e.g. ask for a valid timezone).
      return {
        status: 'error',
        error_message: `Unknown timezone "${timezone}". Use an IANA name like "Asia/Dhaka".`,
      };
    }
  },
});

// ---------------------------------------------------------------------------
// TOOL 2: calculate
// ---------------------------------------------------------------------------
// We use structured arguments (operation + two numbers) instead of
// eval("any string"). Never run eval() on text a model wrote: it can be
// tricked into producing harmful code. Structured inputs are safe and easy
// to validate.
const calculate = new FunctionTool({
  name: 'calculate',
  description:
    'Performs exact arithmetic on two numbers. Always use this for maths ' +
    'instead of calculating in your head.',
  parameters: z.object({
    operation: z
      .enum(['add', 'subtract', 'multiply', 'divide', 'power'])
      .describe('The arithmetic operation to perform.'),
    a: z.number().describe('The first number.'),
    b: z.number().describe('The second number.'),
  }),
  execute: async ({operation, a, b}) => {
    if (operation === 'divide' && b === 0) {
      return {status: 'error', error_message: 'Cannot divide by zero.'};
    }
    const result = {
      add: a + b,
      subtract: a - b,
      multiply: a * b,
      divide: a / b,
      power: a ** b,
    }[operation];
    return {status: 'success', operation, a, b, result};
  },
});

// ---------------------------------------------------------------------------
// TOOL 3: count_words
// ---------------------------------------------------------------------------
// LLMs see "tokens", not letters or words, so they are surprisingly bad at
// counting. A tool makes it exact.
const countWords = new FunctionTool({
  name: 'count_words',
  description:
    'Counts the words and characters in a piece of text. Use it whenever ' +
    'the user asks how long a text is.',
  parameters: z.object({
    text: z.string().describe('The exact text to analyse.'),
  }),
  execute: async ({text}) => {
    const words = text.trim().split(/\s+/).filter(Boolean);
    return {
      status: 'success',
      word_count: words.length,
      character_count: text.length,
    };
  },
});

// ---------------------------------------------------------------------------
// THE AGENT
// ---------------------------------------------------------------------------
export const rootAgent = new LlmAgent({
  name: 'tool_assistant',
  description: 'A helpful assistant that uses tools for time, maths and word counts.',
  model: 'gemini-3.5-flash-lite',

  // The instruction tells the model WHEN to prefer tools. Tool descriptions
  // say what each tool does; the instruction sets the overall policy.
  instruction: `You are a helpful assistant with tools.

- For ANY arithmetic, call the "calculate" tool. Never do maths in your head.
  For multi-step maths, call it several times, one step at a time.
- For the current time or date, call "get_current_time". If the user gives a
  city, convert it to the IANA timezone yourself (e.g. Dhaka -> "Asia/Dhaka").
- For word or character counts, call "count_words".
- If a tool returns status "error", explain the problem to the user in plain words.
- Keep answers short and friendly.`,

  // TOOLS: the list of everything the model is allowed to call.
  tools: [getCurrentTime, calculate, countWords],
});

/**
 * EXERCISES
 * ---------
 * 1. Ask "What is (12 + 8) * 3?" and look at the Events tab. You should see
 *    TWO calculate calls: first add, then multiply. That's the loop repeating.
 * 2. Ask "What time is it in Tokyo and in London?" Gemini can request both
 *    get_current_time calls in parallel in a single step.
 * 3. Ask "What is 10 divided by 0?" and watch how the agent handles the
 *    error the tool returns.
 * 4. YOUR TURN: add a `convert_units` tool (km <-> miles, kg <-> lb,
 *    celsius <-> fahrenheit). Use z.enum for the conversion type and
 *    remember to add it to `tools: [...]`.
 * 5. Experiment: make the calculate description vague, e.g. "does stuff".
 *    Does the model still use it? This shows why descriptions matter.
 */
