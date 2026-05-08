export type Stage =
  | "prospeccao"
  | "contato_inicial"
  | "reuniao"
  | "proposta"
  | "cliente_ativo"
  | "arquivado";

export type Lead = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  instagram: string | null;
  stage: Stage;
  source: string | null;
  tags: string[];
  estimated_value: number | null;
  probability: number | null;
  notes: string | null;
  position: number;
  created_at: string;
  updated_at: string;
};

export type LeadInsert = Omit<Lead, "id" | "created_at" | "updated_at" | "position"> & {
  position?: number;
};

export type InteractionType = "nota" | "ligacao" | "email" | "reuniao" | "mensagem";

export type Interaction = {
  id: string;
  lead_id: string;
  type: InteractionType;
  content: string | null;
  occurred_at: string;
  created_at: string;
};
