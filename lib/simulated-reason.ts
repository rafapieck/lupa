/**
 * Why the AI path fell back to the simulated reading. A fixed list: only the
 * category ever leaves the server, never the key or the error message.
 * (Own file so the browser bundle doesn't pull in the Gemini SDK.)
 */
export const SIMULATED_REASONS = ["quota", "not_found", "overloaded", "timeout", "auth", "missing_key", "other"] as const;
export type SimulatedReason = (typeof SIMULATED_REASONS)[number];
