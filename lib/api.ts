"use client";

import { supabase } from "./supabase";
import type { Lead, Interaction, Stage, InteractionType } from "./types";

function pgError(err: unknown): Error {
  if (err && typeof err === "object") {
    const e = err as { message?: string; details?: string; hint?: string; code?: string };
    const parts = [e.message, e.details, e.hint && `(dica: ${e.hint})`, e.code && `[${e.code}]`]
      .filter(Boolean);
    return new Error(parts.join(" — ") || "Erro desconhecido do Supabase.");
  }
  return new Error(String(err));
}

export async function listLeads(): Promise<Lead[]> {
  const { data, error } = await supabase()
    .from("leads")
    .select("*")
    .order("position", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) throw pgError(error);
  return (data ?? []) as Lead[];
}

export async function getLead(id: string): Promise<Lead | null> {
  const { data, error } = await supabase().from("leads").select("*").eq("id", id).single();
  if (error) {
    if (error.code === "PGRST116") return null;
    throw pgError(error);
  }
  return data as Lead;
}

export async function createLead(lead: Partial<Lead>): Promise<Lead> {
  const payload = {
    name: lead.name ?? "Sem identificação",
    email: lead.email ?? null,
    phone: lead.phone ?? null,
    company: lead.company ?? null,
    instagram: lead.instagram ?? null,
    stage: lead.stage ?? "prospeccao",
    source: lead.source ?? null,
    tags: lead.tags ?? [],
    estimated_value: lead.estimated_value ?? null,
    probability: lead.probability ?? null,
    notes: lead.notes ?? null,
    position: lead.position ?? Date.now(),
  };
  const { data, error } = await supabase().from("leads").insert(payload).select().single();
  if (error) throw pgError(error);
  return data as Lead;
}

export async function updateLead(id: string, patch: Partial<Lead>): Promise<Lead> {
  const { data, error } = await supabase()
    .from("leads")
    .update(patch)
    .eq("id", id)
    .select()
    .single();
  if (error) throw pgError(error);
  return data as Lead;
}

export async function deleteLead(id: string): Promise<void> {
  const { error } = await supabase().from("leads").delete().eq("id", id);
  if (error) throw pgError(error);
}

export async function bulkInsertLeads(leads: Partial<Lead>[]): Promise<number> {
  if (leads.length === 0) return 0;
  const chunkSize = 500;
  let inserted = 0;
  const base = Date.now();
  for (let i = 0; i < leads.length; i += chunkSize) {
    const chunk = leads.slice(i, i + chunkSize).map((l, idx) => ({
      name: l.name ?? "Sem identificação",
      email: l.email ?? null,
      phone: l.phone ?? null,
      company: l.company ?? null,
      instagram: l.instagram ?? null,
      stage: (l.stage ?? "prospeccao") as Stage,
      source: l.source ?? null,
      tags: l.tags ?? [],
      estimated_value: l.estimated_value ?? null,
      probability: l.probability ?? null,
      notes: l.notes ?? null,
      position: base + i + idx,
    }));
    const { error, data } = await supabase().from("leads").insert(chunk).select("id");
    if (error) throw pgError(error);
    inserted += data?.length ?? 0;
  }
  return inserted;
}

export async function moveLead(id: string, stage: Stage, position: number): Promise<void> {
  const { error } = await supabase()
    .from("leads")
    .update({ stage, position })
    .eq("id", id);
  if (error) throw pgError(error);
}

export async function listInteractions(leadId: string): Promise<Interaction[]> {
  const { data, error } = await supabase()
    .from("interactions")
    .select("*")
    .eq("lead_id", leadId)
    .order("occurred_at", { ascending: false });
  if (error) throw pgError(error);
  return (data ?? []) as Interaction[];
}

export async function addInteraction(
  leadId: string,
  type: InteractionType,
  content: string
): Promise<Interaction> {
  const { data, error } = await supabase()
    .from("interactions")
    .insert({ lead_id: leadId, type, content })
    .select()
    .single();
  if (error) throw pgError(error);
  return data as Interaction;
}

export async function deleteInteraction(id: string): Promise<void> {
  const { error } = await supabase().from("interactions").delete().eq("id", id);
  if (error) throw pgError(error);
}
