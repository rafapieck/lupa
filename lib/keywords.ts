import { SIGNALS, type Signal } from "./patterns";
import type { Signals } from "./score";

/**
 * Simple keyword-based signal extraction. Used:
 *  1. as the simulated extraction when Gemini is unavailable, and
 *  2. as a guard on top of Gemini for the unambiguous signals, so text
 *     inside the offer cannot talk the AI out of an obvious red flag.
 */

/** Lowercase and remove accents so "Contratación" matches "contratacion". */
export function normalize(text: string): string {
  return text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

const BRANDS =
  "youtube|tiktok|amazon|mercado ?libre|walmart|coca[ -]?cola|bimbo|pemex|cfe|imss|google|facebook|meta|instagram|netflix|liverpool|coppel|elektra|telcel|bbva|fifa|disney|nike|shein|temu|spotify|uber|didi|rappi";

const SEND = "manda|mandes|mandar|mandame|envia|enviar|envies|enviame|sube|subir|comparte|compartir|foto";
const DOCS =
  "ine|curp|credencial (?:de elector|para votar)|acta de nacimiento|comprobante de domicilio|estado de cuenta|datos bancarios|numero de (?:tarjeta|cuenta)|nip|contrasena|rfc";

const RULES: Record<Exclude<Signal, "unrealistic_pay" | "no_company_name" | "vague_job_description">, RegExp[]> = {
  asks_for_payment: [
    /\b(deposit\w*|transfier\w*|transferencia|anticipo|oxxo|spei)\b/,
    /\b(paga|pagar|pagues|pagas|pago de|cubrir|cubre|costo|cuesta|cuota|cobr\w*)\b.{0,40}\b(uniforme|curso|capacitacion|examen|registro|inscripcion|kit|material|tramite|credencial|gafete|apartar)/,
    /\b(uniforme|curso|capacitacion|examen medico|kit|inscripcion|registro)\b.{0,30}\$\s?\d/,
  ],
  asks_for_personal_documents: [
    new RegExp(`\\b(${SEND})\\b.{0,40}\\b(${DOCS})\\b`),
    new RegExp(`\\b(${DOCS})\\b.{0,30}\\b(por|al|a mi) (whatsapp|whats|correo|mensaje|inbox|privado)\\b`),
  ],
  impersonated_brand: [
    new RegExp(`\\b(reclutador\\w*|de parte de|en nombre de|representante de|agencia de|trabaj\\w* (con|para))\\b.{0,20}\\b(${BRANDS})\\b`),
  ],
  travel_or_housing_bait: [
    /\b(hospedaje|alojamiento|vivienda incluida|casa incluida|cuarto incluido|transporte incluido|pasajes?|boletos? de (avion|autobus)|viaticos)\b/,
    /\b(viaja|viajar|viajas|te llevamos|sales)\b.{0,20}\b(manana|hoy|esta semana|de inmediato)\b/,
    /\btrabajo en (estados unidos|usa|eua|canada|el extranjero)\b/,
  ],
  easy_task_money: [
    /\b(dar|das|dando) (likes?|me gusta)\b/,
    /\b(likes?|ver videos|calificar (productos|hoteles|apps|videos)|resenas pagadas|tareas (sencillas|faciles|simples)|seguir cuentas)\b/,
    /\bgana\w*\b.{0,40}\b\d+ ?min(utos)? (al|por) dia\b/,
  ],
  chat_only_contact: [
    /\b(whatsapp|whats app|whats|wa\.me|telegram|messenger|inbox|al privado|por privado)\b/,
  ],
  immediate_hiring: [
    /\bcontratacion (inmediata|hoy|el mismo dia|al momento)\b/,
    /\b(contratad[oa] hoy|inicio inmediato|ingreso inmediato|empiezas? (hoy|manana|de inmediato)|sin entrevista|hoy mismo|viaja manana)\b/,
  ],
  generic_email: [
    /@(gmail|hotmail|outlook|yahoo|live|icloud)\./,
    /\b(correo|mail|email) de (gmail|hotmail|outlook|yahoo)\b/,
    /\b(gmail|hotmail)\b/,
  ],
};

/** Amounts written like "$35,000", "$9 500", "$1,500.00" or "35 mil". */
function amounts(t: string): number[] {
  const out: number[] = [];
  for (const m of t.matchAll(/\$\s?(\d{1,3}(?:[ ,]\d{3})+|\d+)(?:\.\d+)?/g)) {
    out.push(Number(m[1].replace(/[ ,]/g, "")));
  }
  for (const m of t.matchAll(/\b(\d{1,3}) ?mil\b/g)) out.push(Number(m[1]) * 1000);
  return out;
}

function unrealisticPay(t: string): boolean {
  if (/\b(dinero facil|ingresos ilimitados|gana(r)? miles|hazte rico)\b/.test(t)) return true;
  const max = Math.max(0, ...amounts(t));
  if (/\b(al dia|diarios?|por dia|por hora)\b/.test(t) && max >= 1000) return true;
  if (max >= 25000) return true;
  return max >= 15000 && /\bsin experiencia\b/.test(t);
}

function vagueDescription(t: string): boolean {
  if (/\b(buen sueldo|excelente sueldo|sueldo atractivo|excelentes ingresos|buenos ingresos|sueldo competitivo|varias vacantes|diferentes areas|varios puestos)\b/.test(t)) {
    return true;
  }
  return amounts(t).length === 0;
}

function noCompanyName(t: string): boolean {
  return !/(s\.? ?a\.? de c\.? ?v\.?|\bs\.?a\.?p\.?i\.?\b|\brfc\b|\bempresa:\s*\S|\b(grupo|corporativo|industrias|tiendas) [a-z])/.test(t);
}

export function keywordSignals(text: string): Signals {
  const t = normalize(text).replace(/\s+/g, " ");
  const result = Object.fromEntries(SIGNALS.map((s) => [s, false])) as Signals;
  for (const [signal, patterns] of Object.entries(RULES)) {
    result[signal as Signal] = patterns.some((re) => re.test(t));
  }
  result.unrealistic_pay = unrealisticPay(t);
  result.vague_job_description = vagueDescription(t);
  result.no_company_name = noCompanyName(t);
  return result;
}

/**
 * Signals whose keyword rules are specific enough to trust even when the AI
 * says otherwise. The two fuzzy heuristics are left to the AI.
 */
export const GUARDED_SIGNALS: Signal[] = SIGNALS.filter(
  (s) => s !== "no_company_name" && s !== "vague_job_description",
);
