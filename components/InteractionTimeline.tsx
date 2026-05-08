"use client";

import { useEffect, useState } from "react";
import { Trash2, Phone, Mail, MessageCircle, Users, StickyNote } from "lucide-react";
import type { Interaction, InteractionType } from "@/lib/types";
import { listInteractions, addInteraction, deleteInteraction } from "@/lib/api";
import { INTERACTION_TYPES } from "@/lib/constants";
import { formatDateTime } from "@/lib/utils";

const ICONS: Record<InteractionType, React.ComponentType<{ size?: number }>> = {
  nota: StickyNote,
  ligacao: Phone,
  email: Mail,
  reuniao: Users,
  mensagem: MessageCircle,
};

export default function InteractionTimeline({ leadId }: { leadId: string }) {
  const [items, setItems] = useState<Interaction[]>([]);
  const [type, setType] = useState<InteractionType>("nota");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await listInteractions(leadId);
        if (alive) setItems(data);
      } catch (e: unknown) {
        if (alive) setErr(e instanceof Error ? e.message : "Erro ao carregar.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [leadId]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setSaving(true);
    setErr(null);
    try {
      const created = await addInteraction(leadId, type, content.trim());
      setItems((prev) => [created, ...prev]);
      setContent("");
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Erro ao adicionar.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Apagar esta interação?")) return;
    try {
      await deleteInteraction(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Erro ao apagar.");
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleAdd} className="card p-4 space-y-3">
        <div className="flex gap-2">
          <select
            className="input max-w-40"
            value={type}
            onChange={(e) => setType(e.target.value as InteractionType)}
          >
            {INTERACTION_TYPES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <textarea
          className="input min-h-20"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="O que aconteceu? Liguei e ele pediu pra mandar proposta na próxima semana..."
        />
        <div className="flex justify-end">
          <button type="submit" disabled={saving || !content.trim()} className="btn-primary">
            {saving ? "Adicionando..." : "Adicionar interação"}
          </button>
        </div>
      </form>

      {err && (
        <div className="px-4 py-2 rounded bg-red-50 border border-red-200 text-red-700 text-sm">
          {err}
        </div>
      )}

      {loading ? (
        <div className="text-sm text-[var(--muted-foreground)]">Carregando...</div>
      ) : items.length === 0 ? (
        <div className="text-sm text-[var(--muted-foreground)] text-center py-6">
          Nenhuma interação registrada.
        </div>
      ) : (
        <ol className="relative border-l-2 border-[var(--border)] pl-6 space-y-4 ml-2">
          {items.map((it) => {
            const Icon = ICONS[it.type] ?? StickyNote;
            const label = INTERACTION_TYPES.find((t) => t.id === it.type)?.label ?? it.type;
            return (
              <li key={it.id} className="relative">
                <span className="absolute -left-[31px] brand-gradient w-6 h-6 rounded-full flex items-center justify-center text-black">
                  <Icon size={12} />
                </span>
                <div className="card p-3">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
                      <span className="font-semibold text-[var(--foreground)]">{label}</span>
                      <span>·</span>
                      <span>{formatDateTime(it.occurred_at)}</span>
                    </div>
                    <button
                      onClick={() => handleDelete(it.id)}
                      className="p-1 rounded hover:bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-red-600"
                      aria-label="Apagar"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  {it.content && (
                    <div className="text-sm whitespace-pre-wrap">{it.content}</div>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
