"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Plus, Upload, Search, Trash2, Pencil } from "lucide-react";
import type { Lead, Stage } from "@/lib/types";
import { listLeads, createLead, deleteLead } from "@/lib/api";
import { PIPELINE_STAGES, STAGE_ACCENT, STAGE_LABEL } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/utils";
import LeadForm from "@/components/LeadForm";
import Modal from "@/components/ui/Modal";
import PageHeader from "@/components/ui/PageHeader";
import SetupNotice from "@/components/ui/SetupNotice";
import { hasSupabaseConfig } from "@/lib/supabase";

export default function LeadsListPage() {
  return (
    <Suspense fallback={<div className="px-8 py-6 text-sm">Carregando...</div>}>
      <LeadsListInner />
    </Suspense>
  );
}

function LeadsListInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(hasSupabaseConfig());
  const [err, setErr] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState<Stage | "all">("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [tagFilter, setTagFilter] = useState<string>("all");
  const [creating, setCreating] = useState(params.get("new") === "1");

  useEffect(() => {
    if (!hasSupabaseConfig()) return;
    let alive = true;
    (async () => {
      try {
        const data = await listLeads();
        if (alive) setLeads(data);
      } catch (e: unknown) {
        if (alive) setErr(e instanceof Error ? e.message : "Erro.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const sources = useMemo(() => {
    const s = new Set<string>();
    for (const l of leads) if (l.source) s.add(l.source);
    return Array.from(s).sort();
  }, [leads]);

  const tags = useMemo(() => {
    const s = new Set<string>();
    for (const l of leads) for (const t of l.tags ?? []) s.add(t);
    return Array.from(s).sort();
  }, [leads]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return leads.filter((l) => {
      if (stageFilter !== "all" && l.stage !== stageFilter) return false;
      if (sourceFilter !== "all" && (l.source ?? "") !== sourceFilter) return false;
      if (tagFilter !== "all" && !(l.tags ?? []).includes(tagFilter)) return false;
      if (q) {
        const hay = [l.name, l.email, l.company, l.phone, l.instagram]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [leads, search, stageFilter, sourceFilter, tagFilter]);

  async function handleCreate(values: Partial<Lead>) {
    const created = await createLead(values);
    setLeads((prev) => [created, ...prev]);
    setCreating(false);
    if (params.get("new")) router.replace("/leads");
  }

  async function handleDelete(id: string) {
    if (!confirm("Apagar este lead?")) return;
    await deleteLead(id);
    setLeads((prev) => prev.filter((l) => l.id !== id));
  }

  if (!hasSupabaseConfig()) {
    return (
      <div className="px-8 py-12">
        <SetupNotice />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Leads"
        description={`${leads.length} lead${leads.length === 1 ? "" : "s"} no total.`}
        actions={
          <>
            <Link href="/leads/import" className="btn-ghost">
              <Upload size={16} /> Importar
            </Link>
            <button onClick={() => setCreating(true)} className="btn-primary">
              <Plus size={16} /> Novo lead
            </button>
          </>
        }
      />

      <div className="px-8 pb-8 space-y-4">
        <div className="card p-3 flex flex-wrap gap-2 items-center">
          <div className="flex items-center gap-2 flex-1 min-w-60 px-2">
            <Search size={16} className="text-[var(--muted-foreground)]" />
            <input
              className="bg-transparent outline-none text-sm w-full"
              placeholder="Buscar por nome, e-mail, empresa..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="input max-w-48"
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value as Stage | "all")}
          >
            <option value="all">Todos os estágios</option>
            {PIPELINE_STAGES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
          <select
            className="input max-w-48"
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
          >
            <option value="all">Todas as fontes</option>
            {sources.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select
            className="input max-w-48"
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
          >
            <option value="all">Todas as tags</option>
            {tags.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {err && (
          <div className="px-4 py-2 rounded bg-red-50 border border-red-200 text-red-700 text-sm">
            {err}
          </div>
        )}

        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--muted)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <tr>
                  <th className="text-left px-4 py-2">Nome</th>
                  <th className="text-left px-4 py-2">Empresa</th>
                  <th className="text-left px-4 py-2">Estágio</th>
                  <th className="text-left px-4 py-2">Fonte</th>
                  <th className="text-right px-4 py-2">Valor</th>
                  <th className="text-left px-4 py-2">Criado</th>
                  <th className="text-right px-4 py-2">Ações</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-6 text-[var(--muted-foreground)]">
                      Carregando...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-[var(--muted-foreground)]">
                      Nenhum lead encontrado.
                    </td>
                  </tr>
                ) : (
                  filtered.map((l) => (
                    <tr key={l.id} className="border-t border-[var(--border)] hover:bg-[var(--muted)]/50">
                      <td className="px-4 py-2.5">
                        <Link href={`/leads/${l.id}`} className="font-medium hover:underline">
                          {l.name}
                        </Link>
                        {l.email && (
                          <div className="text-xs text-[var(--muted-foreground)]">{l.email}</div>
                        )}
                      </td>
                      <td className="px-4 py-2.5">{l.company ?? "—"}</td>
                      <td className="px-4 py-2.5">
                        <span
                          className="tag"
                          style={{ background: `${STAGE_ACCENT[l.stage]}20`, color: STAGE_ACCENT[l.stage] }}
                        >
                          {STAGE_LABEL[l.stage]}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-[var(--muted-foreground)]">
                        {l.source ?? "—"}
                      </td>
                      <td className="px-4 py-2.5 text-right font-medium">
                        {formatCurrency(l.estimated_value)}
                      </td>
                      <td className="px-4 py-2.5 text-[var(--muted-foreground)]">
                        {formatDate(l.created_at)}
                      </td>
                      <td className="px-4 py-2.5 text-right whitespace-nowrap">
                        <Link
                          href={`/leads/${l.id}`}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-[var(--muted)]"
                        >
                          <Pencil size={14} /> Abrir
                        </Link>
                        <button
                          onClick={() => handleDelete(l.id)}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-red-50 text-red-600"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal open={creating} onClose={() => setCreating(false)} title="Novo lead" size="lg">
        <LeadForm
          onSubmit={handleCreate}
          onCancel={() => setCreating(false)}
          submitLabel="Criar lead"
        />
      </Modal>
    </div>
  );
}
