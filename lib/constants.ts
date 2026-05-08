import type { Stage, InteractionType } from "./types";

export const PIPELINE_STAGES: { id: Stage; label: string; accent: string }[] = [
  { id: "novo_lead", label: "Novo Lead", accent: "#9ca3af" },
  { id: "contato_feito", label: "Contato Feito", accent: "#3b82f6" },
  { id: "proposta_enviada", label: "Proposta Enviada", accent: "#a855f7" },
  { id: "negociacao", label: "Negociação", accent: "#ffaa00" },
  { id: "fechado_ganhou", label: "Fechado (Ganhou)", accent: "#10b981" },
  { id: "perdido", label: "Perdido", accent: "#ef4444" },
];

export const STAGE_LABEL: Record<Stage, string> = Object.fromEntries(
  PIPELINE_STAGES.map((s) => [s.id, s.label])
) as Record<Stage, string>;

export const STAGE_ACCENT: Record<Stage, string> = Object.fromEntries(
  PIPELINE_STAGES.map((s) => [s.id, s.accent])
) as Record<Stage, string>;

export const LEAD_SOURCES = [
  "Instagram",
  "Indicação",
  "Site",
  "LinkedIn",
  "WhatsApp",
  "Evento",
  "Outro",
];

export const INTERACTION_TYPES: { id: InteractionType; label: string }[] = [
  { id: "nota", label: "Nota" },
  { id: "ligacao", label: "Ligação" },
  { id: "email", label: "E-mail" },
  { id: "reuniao", label: "Reunião" },
  { id: "mensagem", label: "Mensagem" },
];

export const LEAD_FIELDS: { key: string; label: string; aliases: string[] }[] = [
  { key: "name", label: "Nome", aliases: ["nome", "name", "cliente", "lead", "contato"] },
  { key: "email", label: "E-mail", aliases: ["email", "e-mail", "mail"] },
  { key: "phone", label: "Telefone", aliases: ["telefone", "phone", "celular", "whatsapp", "tel"] },
  { key: "company", label: "Empresa", aliases: ["empresa", "company", "negocio", "marca"] },
  { key: "instagram", label: "Instagram", aliases: ["instagram", "ig", "@"] },
  { key: "source", label: "Fonte", aliases: ["fonte", "source", "origem", "canal"] },
  { key: "tags", label: "Tags", aliases: ["tags", "categorias", "rotulos"] },
  { key: "estimated_value", label: "Valor estimado", aliases: ["valor", "value", "ticket", "preco", "preço"] },
  { key: "probability", label: "Probabilidade (%)", aliases: ["probabilidade", "probability", "chance"] },
  { key: "notes", label: "Observações", aliases: ["notas", "observacoes", "observações", "notes", "obs"] },
];
