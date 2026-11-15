import { formatInput } from "./format";
import { DEFAULTS, FIELD_SPECS, type FieldName, type RawInputs } from "./simulate";

/** What the simulator inputs hold: the text the user typed, per field. */
export type RawState = Record<FieldName, string>;

export const initialRaw = (): RawState =>
  Object.fromEntries(FIELD_SPECS.map((f) => [f.name, formatInput(DEFAULTS[f.name].value)])) as RawState;

/** Fills a full RawState from partial raw values (missing fields keep their default). */
export function toRawState(partial: RawInputs): RawState {
  const out = initialRaw();
  for (const f of FIELD_SPECS) {
    const v = partial[f.name];
    if (typeof v === "string") out[f.name] = v;
    else if (typeof v === "number" && Number.isFinite(v)) out[f.name] = formatInput(v);
  }
  return out;
}
