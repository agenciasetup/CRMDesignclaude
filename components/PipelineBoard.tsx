"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  DragOverEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  closestCorners,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Link from "next/link";
import { Plus, Building2, AtSign } from "lucide-react";
import type { Lead, Stage } from "@/lib/types";
import { PIPELINE_STAGES } from "@/lib/constants";
import { listLeads, createLead, moveLead } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import Modal from "./ui/Modal";
import LeadForm from "./LeadForm";

export default function PipelineBoard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [creatingFor, setCreatingFor] = useState<Stage | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await listLeads();
        if (alive) setLeads(data);
      } catch (e: unknown) {
        if (alive) setErr(e instanceof Error ? e.message : "Erro ao carregar leads.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const byStage = useMemo(() => {
    const map: Record<Stage, Lead[]> = {
      novo_lead: [],
      contato_feito: [],
      proposta_enviada: [],
      negociacao: [],
      fechado_ganhou: [],
      perdido: [],
    };
    for (const l of leads) map[l.stage]?.push(l);
    for (const k of Object.keys(map) as Stage[]) {
      map[k].sort((a, b) => a.position - b.position);
    }
    return map;
  }, [leads]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  function findLead(id: string) {
    return leads.find((l) => l.id === id);
  }

  function resolveStage(id: string): Stage | null {
    if (id.startsWith("col-")) {
      const s = id.slice(4) as Stage;
      if ((PIPELINE_STAGES as { id: Stage }[]).some((x) => x.id === s)) return s;
    }
    const l = findLead(id);
    return l?.stage ?? null;
  }

  function handleDragStart(e: DragStartEvent) {
    setActiveId(String(e.active.id));
  }

  function handleDragOver(e: DragOverEvent) {
    const { active, over } = e;
    if (!over) return;
    const activeId = String(active.id);
    const overId = String(over.id);
    const activeLead = findLead(activeId);
    if (!activeLead) return;
    const overStage = resolveStage(overId);
    if (!overStage) return;
    if (activeLead.stage === overStage) return;
    setLeads((prev) =>
      prev.map((l) => (l.id === activeId ? { ...l, stage: overStage } : l))
    );
  }

  async function handleDragEnd(e: DragEndEvent) {
    setActiveId(null);
    const { active, over } = e;
    if (!over) return;
    const activeId = String(active.id);
    const overId = String(over.id);
    const activeLead = findLead(activeId);
    if (!activeLead) return;
    const overStage = resolveStage(overId);
    if (!overStage) return;

    const targetItems = leads
      .filter((l) => l.stage === overStage)
      .sort((a, b) => a.position - b.position);

    const oldIndex = targetItems.findIndex((l) => l.id === activeId);
    let newIndex: number;
    if (overId.startsWith("col-")) {
      newIndex = oldIndex >= 0 ? targetItems.length - 1 : targetItems.length;
    } else {
      const overIndex = targetItems.findIndex((l) => l.id === overId);
      newIndex = overIndex >= 0 ? overIndex : targetItems.length - 1;
    }

    let reordered = targetItems;
    if (oldIndex >= 0 && newIndex >= 0 && oldIndex !== newIndex) {
      reordered = arrayMove(targetItems, oldIndex, newIndex);
    }

    const updates = reordered.map((l, i) => ({ id: l.id, position: i, stage: overStage }));
    const updatesById = new Map(updates.map((u) => [u.id, u]));

    setLeads((prev) =>
      prev.map((l) => {
        const u = updatesById.get(l.id);
        return u ? { ...l, stage: u.stage, position: u.position } : l;
      })
    );

    try {
      await Promise.all(updates.map((u) => moveLead(u.id, u.stage, u.position)));
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Erro ao mover lead.");
    }
  }

  async function handleCreate(values: Partial<Lead>) {
    const stage = (creatingFor ?? "novo_lead") as Stage;
    const created = await createLead({ ...values, stage });
    setLeads((prev) => [...prev, created]);
    setCreatingFor(null);
  }

  if (loading) {
    return <div className="px-8 py-6 text-sm text-[var(--muted-foreground)]">Carregando pipeline...</div>;
  }

  return (
    <div className="px-8 pb-8">
      {err && (
        <div className="mb-4 px-4 py-2 rounded bg-red-50 border border-red-200 text-red-700 text-sm">
          {err}
        </div>
      )}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto scrollbar-slim pb-4">
          {PIPELINE_STAGES.map((stage) => {
            const items = byStage[stage.id];
            const total = items.reduce(
              (sum, l) => sum + (l.estimated_value ?? 0),
              0
            );
            return (
              <Column
                key={stage.id}
                stage={stage.id}
                label={stage.label}
                accent={stage.accent}
                count={items.length}
                total={total}
                items={items}
                onAdd={() => setCreatingFor(stage.id)}
              />
            );
          })}
        </div>
        <DragOverlay>
          {activeId ? <LeadCardOverlay lead={findLead(activeId)!} /> : null}
        </DragOverlay>
      </DndContext>
      <Modal
        open={!!creatingFor}
        onClose={() => setCreatingFor(null)}
        title="Novo lead"
        size="lg"
      >
        <LeadForm
          initial={{ stage: creatingFor ?? "novo_lead" }}
          onSubmit={handleCreate}
          onCancel={() => setCreatingFor(null)}
          submitLabel="Criar lead"
        />
      </Modal>
    </div>
  );
}

function Column({
  stage,
  label,
  accent,
  count,
  total,
  items,
  onAdd,
}: {
  stage: Stage;
  label: string;
  accent: string;
  count: number;
  total: number;
  items: Lead[];
  onAdd: () => void;
}) {
  const droppableId = `col-${stage}`;
  const { setNodeRef, isOver } = useDroppable({ id: droppableId });
  return (
    <div
      className={`w-72 shrink-0 bg-[var(--muted)] rounded-xl flex flex-col max-h-[calc(100vh-12rem)] transition-colors ${
        isOver ? "ring-2 ring-[var(--brand-yellow)]" : ""
      }`}
    >
      <div className="px-3 py-3 border-b border-black/5 flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ background: accent }}
          />
          <div className="font-semibold text-sm truncate">{label}</div>
          <div className="text-xs text-[var(--muted-foreground)]">{count}</div>
        </div>
        <button
          onClick={onAdd}
          className="p-1 rounded hover:bg-black/5"
          aria-label="Adicionar lead"
        >
          <Plus size={16} />
        </button>
      </div>
      {total > 0 && (
        <div className="px-3 py-1.5 text-xs text-[var(--muted-foreground)]">
          {formatCurrency(total)}
        </div>
      )}
      <SortableContext
        id={droppableId}
        items={items.map((i) => i.id)}
        strategy={verticalListSortingStrategy}
      >
        <div
          ref={setNodeRef}
          className="flex-1 overflow-y-auto scrollbar-slim p-2 space-y-2 min-h-32"
        >
          {items.map((lead) => (
            <SortableLeadCard key={lead.id} lead={lead} />
          ))}
          {items.length === 0 && (
            <div className="text-xs text-[var(--muted-foreground)] text-center py-6 select-none">
              Sem leads
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}

function SortableLeadCard({ lead }: { lead: Lead }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: lead.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <LeadCardInner lead={lead} />
    </div>
  );
}

function LeadCardOverlay({ lead }: { lead: Lead }) {
  return (
    <div className="rotate-2">
      <LeadCardInner lead={lead} />
    </div>
  );
}

function LeadCardInner({ lead }: { lead: Lead }) {
  return (
    <div className="card p-3 shadow-sm cursor-grab active:cursor-grabbing">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <Link
            href={`/leads/${lead.id}`}
            className="font-semibold text-sm leading-tight hover:underline block truncate"
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            {lead.name}
          </Link>
          {lead.company && (
            <div className="text-xs text-[var(--muted-foreground)] flex items-center gap-1 mt-0.5">
              <Building2 size={12} />
              <span className="truncate">{lead.company}</span>
            </div>
          )}
          {lead.instagram && (
            <div className="text-xs text-[var(--muted-foreground)] flex items-center gap-1 mt-0.5">
              <AtSign size={12} />
              <span className="truncate">{lead.instagram}</span>
            </div>
          )}
        </div>
        {lead.estimated_value != null && (
          <div className="text-xs font-semibold whitespace-nowrap brand-gradient-text">
            {formatCurrency(lead.estimated_value)}
          </div>
        )}
      </div>
      {(lead.tags?.length ?? 0) > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {lead.tags.slice(0, 3).map((t) => (
            <span key={t} className="tag">
              {t}
            </span>
          ))}
          {lead.tags.length > 3 && (
            <span className="text-xs text-[var(--muted-foreground)]">
              +{lead.tags.length - 3}
            </span>
          )}
        </div>
      )}
      {lead.probability != null && (
        <div className="mt-2 h-1 bg-black/5 rounded">
          <div
            className="h-1 rounded brand-gradient"
            style={{ width: `${Math.min(100, Math.max(0, lead.probability))}%` }}
          />
        </div>
      )}
    </div>
  );
}
