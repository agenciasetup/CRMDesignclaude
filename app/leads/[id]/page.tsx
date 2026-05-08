"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Trash2, Mail, Phone, Building2, AtSign } from "lucide-react";
import type { Lead, Stage } from "@/lib/types";
import { getLead, updateLead, deleteLead } from "@/lib/api";
import { PIPELINE_STAGES, STAGE_ACCENT, STAGE_LABEL } from "@/lib/constants";
import { formatCurrency, initialsOf } from "@/lib/utils";
import LeadForm from "@/components/LeadForm";
import InteractionTimeline from "@/components/InteractionTimeline";
import PageHeader from "@/components/ui/PageHeader";

export default function LeadProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"dados" | "interacoes">("dados");
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await getLead(id);
        if (alive) setLead(data);
      } catch (e: unknown) {
        if (alive) setErr(e instanceof Error ? e.message : "Erro ao carregar.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  async function handleSave(values: Partial<Lead>) {
    if (!lead) return;
    const updated = await updateLead(lead.id, values);
    setLead(updated);
  }

  async function handleDelete() {
    if (!lead) return;
    if (!confirm(`Apagar lead "${lead.name}"? Essa ação não pode ser desfeita.`)) return;
    await deleteLead(lead.id);
    router.push("/pipeline");
  }

  async function handleStageChange(stage: Stage) {
    if (!lead) return;
    const updated = await updateLead(lead.id, { stage });
    setLead(updated);
  }

  if (loading) {
    return <div className="px-8 py-8 text-sm text-[var(--muted-foreground)]">Carregando...</div>;
  }
  if (err) {
    return <div className="px-8 py-8 text-red-600 text-sm">{err}</div>;
  }
  if (!lead) {
    return (
      <div className="px-8 py-8">
        <Link href="/pipeline" className="text-sm hover:underline">
          ← Voltar ao pipeline
        </Link>
        <div className="mt-4">Lead não encontrado.</div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={lead.name}
        description={lead.company ?? undefined}
        actions={
          <>
            <Link href="/pipeline" className="btn-ghost">
              <ArrowLeft size={16} /> Pipeline
            </Link>
            <button onClick={handleDelete} className="btn-ghost text-red-600">
              <Trash2 size={16} /> Apagar
            </button>
          </>
        }
      />

      <div className="px-8 pb-8 space-y-6">
        <div className="card p-5 flex flex-col md:flex-row md:items-center gap-5">
          <div className="brand-gradient w-16 h-16 rounded-2xl flex items-center justify-center text-black font-bold text-xl shrink-0">
            {initialsOf(lead.name) || "?"}
          </div>
          <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
            <Stat
              label="Estágio"
              value={
                <select
                  className="input mt-1"
                  value={lead.stage}
                  onChange={(e) => handleStageChange(e.target.value as Stage)}
                  style={{
                    borderColor: STAGE_ACCENT[lead.stage],
                  }}
                >
                  {PIPELINE_STAGES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              }
            />
            <Stat
              label="Valor estimado"
              value={
                <div className="font-semibold brand-gradient-text text-lg">
                  {formatCurrency(lead.estimated_value)}
                </div>
              }
            />
            <Stat
              label="Probabilidade"
              value={
                <div className="font-semibold text-lg">
                  {lead.probability != null ? `${lead.probability}%` : "—"}
                </div>
              }
            />
            <Stat
              label="Fonte"
              value={<div className="text-sm">{lead.source ?? "—"}</div>}
            />
          </div>
        </div>

        <div className="card p-5">
          <div className="flex flex-wrap gap-4 text-sm">
            {lead.email && (
              <a href={`mailto:${lead.email}`} className="flex items-center gap-2 hover:underline">
                <Mail size={14} /> {lead.email}
              </a>
            )}
            {lead.phone && (
              <a href={`tel:${lead.phone}`} className="flex items-center gap-2 hover:underline">
                <Phone size={14} /> {lead.phone}
              </a>
            )}
            {lead.company && (
              <div className="flex items-center gap-2">
                <Building2 size={14} /> {lead.company}
              </div>
            )}
            {lead.instagram && (
              <a
                href={`https://instagram.com/${lead.instagram.replace(/^@/, "")}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 hover:underline"
              >
                <AtSign size={14} /> {lead.instagram}
              </a>
            )}
          </div>
          {(lead.tags?.length ?? 0) > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {lead.tags.map((t) => (
                <span key={t} className="tag">
                  {t}
                </span>
              ))}
            </div>
          )}
          <div className="text-xs text-[var(--muted-foreground)] mt-3">
            Criado em {new Date(lead.created_at).toLocaleString("pt-BR")} · Atualizado{" "}
            {new Date(lead.updated_at).toLocaleString("pt-BR")} · Estágio atual:{" "}
            <span style={{ color: STAGE_ACCENT[lead.stage] }}>{STAGE_LABEL[lead.stage]}</span>
          </div>
        </div>

        <div className="border-b border-[var(--border)] flex gap-1">
          <TabButton active={tab === "dados"} onClick={() => setTab("dados")}>
            Dados
          </TabButton>
          <TabButton active={tab === "interacoes"} onClick={() => setTab("interacoes")}>
            Interações
          </TabButton>
        </div>

        {tab === "dados" ? (
          <div className="card p-5">
            <LeadForm initial={lead} onSubmit={handleSave} submitLabel="Salvar alterações" />
          </div>
        ) : (
          <InteractionTimeline leadId={lead.id} />
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
        {label}
      </div>
      <div className="mt-1">{value}</div>
    </div>
  );
}

function TabButton({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium border-b-2 -mb-[2px] transition-colors ${
        active ? "border-[var(--brand-yellow)] text-[var(--foreground)]" : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
      }`}
    >
      {children}
    </button>
  );
}
