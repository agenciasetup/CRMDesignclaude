import type { Stage, InteractionType } from "./types";

export const PIPELINE_STAGES: { id: Stage; label: string; accent: string }[] = [
  { id: "prospeccao", label: "Prospecção", accent: "#94a3b8" },
  { id: "contato_inicial", label: "Contato Inicial", accent: "#3b82f6" },
  { id: "reuniao", label: "Reunião / Diagnóstico", accent: "#6366f1" },
  { id: "proposta", label: "Proposta de Honorários", accent: "#0b2545" },
  { id: "cliente_ativo", label: "Cliente Ativo", accent: "#c9a14a" },
  { id: "arquivado", label: "Arquivado", accent: "#b91c1c" },
];

export const STAGE_LABEL: Record<Stage, string> = Object.fromEntries(
  PIPELINE_STAGES.map((s) => [s.id, s.label])
) as Record<Stage, string>;

export const STAGE_ACCENT: Record<Stage, string> = Object.fromEntries(
  PIPELINE_STAGES.map((s) => [s.id, s.accent])
) as Record<Stage, string>;

export const LEAD_SOURCES = [
  "Indicação",
  "LinkedIn",
  "Site",
  "Google",
  "OAB / Eventos jurídicos",
  "Networking",
  "Imprensa / Mídia",
  "Instagram",
  "Outro",
];

export const INTERACTION_TYPES: { id: InteractionType; label: string }[] = [
  { id: "nota", label: "Anotação" },
  { id: "ligacao", label: "Ligação" },
  { id: "email", label: "E-mail" },
  { id: "reuniao", label: "Reunião" },
  { id: "mensagem", label: "Mensagem" },
];

export const LEAD_FIELDS: { key: string; label: string; aliases: string[] }[] = [
  { key: "name", label: "Razão social / Contato", aliases: ["nome", "name", "cliente", "lead", "contato", "razao", "razao social", "responsavel"] },
  { key: "email", label: "E-mail", aliases: ["email", "e-mail", "mail"] },
  { key: "phone", label: "Telefone", aliases: ["telefone", "phone", "celular", "whatsapp", "tel"] },
  { key: "company", label: "Empresa", aliases: ["empresa", "company", "negocio", "marca", "escritorio", "cnpj"] },
  { key: "instagram", label: "Perfil online", aliases: ["instagram", "ig", "@", "linkedin", "site", "url"] },
  { key: "source", label: "Origem", aliases: ["fonte", "source", "origem", "canal"] },
  { key: "tags", label: "Áreas / Tags", aliases: ["tags", "categorias", "rotulos", "areas", "atuacao"] },
  { key: "estimated_value", label: "Honorários estimados", aliases: ["valor", "value", "ticket", "preco", "preço", "honorarios"] },
  { key: "probability", label: "Probabilidade (%)", aliases: ["probabilidade", "probability", "chance"] },
  { key: "notes", label: "Observações", aliases: ["notas", "observacoes", "observações", "notes", "obs"] },
];
