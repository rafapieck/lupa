/**
 * Verified fraud patterns. Mirrors supabase/seed.sql and is used as a local
 * fallback when Supabase is not configured or cannot be reached.
 */

export const SIGNALS = [
  "asks_for_payment",
  "asks_for_personal_documents",
  "impersonated_brand",
  "travel_or_housing_bait",
  "easy_task_money",
  "chat_only_contact",
  "unrealistic_pay",
  "immediate_hiring",
  "generic_email",
  "vague_job_description",
  "no_company_name",
] as const;

export type Signal = (typeof SIGNALS)[number];

export type FraudPattern = {
  id: string;
  signal: Signal;
  weight: number;
  label_es: string;
  next_step_es: string;
  source: string;
};

export const SOURCE_POLICIA_CIBERNETICA = "Policía Cibernética CDMX";
export const SOURCE_SSC = "SSC CDMX";
export const SOURCE_GUARDIA_NACIONAL = "Guardia Nacional";

export const LOCAL_PATTERNS: FraudPattern[] = [
  {
    id: "upfront_payment",
    signal: "asks_for_payment",
    weight: 4,
    label_es: "Te piden dinero antes de contratarte",
    next_step_es:
      "No pagues nada. Ninguna empresa real cobra por contratarte (ni uniforme, ni curso, ni examen médico).",
    source: SOURCE_POLICIA_CIBERNETICA,
  },
  {
    id: "personal_documents",
    signal: "asks_for_personal_documents",
    weight: 4,
    label_es: "Te piden tu INE, CURP u otros documentos por mensaje",
    next_step_es:
      "No mandes fotos de tu INE ni de otros documentos. Entrégalos solo en persona, en la empresa, ya contratada.",
    source: SOURCE_GUARDIA_NACIONAL,
  },
  {
    id: "impersonated_brand",
    signal: "impersonated_brand",
    weight: 3,
    label_es: "Usan el nombre de una empresa famosa sin forma de comprobarlo",
    next_step_es:
      "Busca la vacante en la página oficial de esa empresa. Si no aparece ahí, no sigas.",
    source: SOURCE_POLICIA_CIBERNETICA,
  },
  {
    id: "travel_housing_bait",
    signal: "travel_or_housing_bait",
    weight: 3,
    label_es: "Te ofrecen viaje u hospedaje para irte de inmediato",
    next_step_es:
      "No viajes ni aceptes transporte de desconocidos. Avisa a tu familia y llama al 088 si te presionan.",
    source: SOURCE_GUARDIA_NACIONAL,
  },
  {
    id: "easy_task_money",
    signal: "easy_task_money",
    weight: 3,
    label_es: "Mucho dinero por tareas muy fáciles (dar likes, ver videos)",
    next_step_es:
      "No sigas. Estas \"tareas\" terminan pidiéndote que deposites dinero para \"desbloquear\" tus pagos.",
    source: SOURCE_SSC,
  },
  {
    id: "chat_only_contact",
    signal: "chat_only_contact",
    weight: 2,
    label_es: "Todo es por WhatsApp o chat, sin entrevista en persona",
    next_step_es:
      "Pide una entrevista presencial o una videollamada con la empresa. Si se niegan, desconfía.",
    source: SOURCE_POLICIA_CIBERNETICA,
  },
  {
    id: "unrealistic_pay",
    signal: "unrealistic_pay",
    weight: 2,
    label_es: "Sueldo muy alto para un trabajo sin experiencia",
    next_step_es:
      "Compara el sueldo con otras vacantes iguales. Si es mucho más alto, es para engancharte.",
    source: SOURCE_SSC,
  },
  {
    id: "immediate_hiring",
    signal: "immediate_hiring",
    weight: 2,
    label_es: "Contratación inmediata, sin entrevista ni proceso",
    next_step_es:
      "Tómate tu tiempo. Una empresa real te entrevista antes de contratarte; la prisa es para que no lo pienses.",
    source: SOURCE_SSC,
  },
  {
    id: "generic_email",
    signal: "generic_email",
    weight: 1,
    label_es: "El contacto es un correo gratuito (Gmail, Hotmail), no de la empresa",
    next_step_es:
      "Pide el nombre completo y el RFC de la empresa y búscalos antes de mandar tus datos.",
    source: SOURCE_GUARDIA_NACIONAL,
  },
  {
    id: "vague_job_description",
    signal: "vague_job_description",
    weight: 1,
    label_es: "No dicen qué vas a hacer ni cuánto vas a ganar",
    next_step_es:
      "Pregunta por escrito: puesto, funciones, sueldo, horario y dirección del trabajo.",
    source: SOURCE_GUARDIA_NACIONAL,
  },
  {
    id: "no_company_name",
    signal: "no_company_name",
    weight: 1,
    label_es: "No dicen el nombre de la empresa",
    next_step_es:
      "Pide el nombre de la empresa y su dirección. Búscala en Google Maps y en internet antes de ir.",
    source: SOURCE_POLICIA_CIBERNETICA,
  },
];
