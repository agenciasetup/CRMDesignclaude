"use client";

import { useEffect, useMemo, useState } from "react";
import { Users, DollarSign, Trophy, TrendingUp } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { Lead } from "@/lib/types";
import { listLeads } from "@/lib/api";
import { PIPELINE_STAGES, STAGE_LABEL, STAGE_ACCENT } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import PageHeader from "@/components/ui/PageHeader";
import SetupNotice from "@/components/ui/SetupNotice";
import { hasSupabaseConfig } from "@/lib/supabase";

export default function DashboardPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(hasSupabaseConfig());

  useEffect(() => {
    if (!hasSupabaseConfig()) return;
    let alive = true;
    (async () => {
      try {
        const data = await listLeads();
        if (alive) setLeads(data);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const stats = useMemo(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const open = leads.filter((l) => l.stage !== "cliente_ativo" && l.stage !== "arquivado");
    const totalPipeline = open.reduce((s, l) => s + (l.estimated_value ?? 0), 0);
    const wonAll = leads.filter((l) => l.stage === "cliente_ativo");
    const wonMonth = wonAll.filter((l) => new Date(l.updated_at) >= monthStart);
    const wonMonthValue = wonMonth.reduce((s, l) => s + (l.estimated_value ?? 0), 0);
    const closed = leads.filter(
      (l) => l.stage === "cliente_ativo" || l.stage === "arquivado"
    ).length;
    const conversion = closed > 0 ? Math.round((wonAll.length / closed) * 100) : 0;
    return {
      total: leads.length,
      totalPipeline,
      wonMonth: wonMonth.length,
      wonMonthValue,
      conversion,
    };
  }, [leads]);

  const chartData = useMemo(
    () =>
      PIPELINE_STAGES.map((s) => ({
        name: s.label,
        count: leads.filter((l) => l.stage === s.id).length,
        color: s.accent,
      })),
    [leads]
  );

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
        title="Dashboard"
        description="Visão consolidada da carteira e do pipeline de prospecção."
      />

      <div className="px-8 pb-12 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPI
            label="Cadastros na carteira"
            value={stats.total}
            icon={<Users size={18} />}
          />
          <KPI
            label="Honorários em prospecção"
            value={formatCurrency(stats.totalPipeline)}
            icon={<DollarSign size={18} />}
            highlight
          />
          <KPI
            label="Contratos firmados no mês"
            value={`${stats.wonMonth} · ${formatCurrency(stats.wonMonthValue)}`}
            icon={<Trophy size={18} />}
          />
          <KPI
            label="Taxa de conversão"
            value={`${stats.conversion}%`}
            icon={<TrendingUp size={18} />}
          />
        </div>

        <div className="card p-5">
          <h3 className="font-semibold mb-4">Distribuição por estágio</h3>
          {loading ? (
            <div className="text-sm text-[var(--muted-foreground)]">Carregando...</div>
          ) : (
            <div style={{ width: "100%", height: 280 }}>
              <ResponsiveContainer>
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, border: "1px solid #e5e5e5" }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {chartData.map((d) => (
                      <Cell key={d.name} fill={d.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="card p-5">
          <h3 className="font-semibold mb-4">Resumo financeiro por estágio</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {PIPELINE_STAGES.map((s) => {
              const items = leads.filter((l) => l.stage === s.id);
              const value = items.reduce((sum, l) => sum + (l.estimated_value ?? 0), 0);
              return (
                <div key={s.id} className="border border-[var(--border)] rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ background: STAGE_ACCENT[s.id] }}
                    />
                    <div className="font-medium text-sm">{STAGE_LABEL[s.id]}</div>
                  </div>
                  <div className="flex items-end justify-between">
                    <div className="text-2xl font-bold">{items.length}</div>
                    <div className="text-xs text-[var(--muted-foreground)]">
                      {formatCurrency(value)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function KPI({
  label,
  value,
  icon,
  highlight,
}: {
  label: string;
  value: React.ReactNode;
  icon: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div className={`card p-4 ${highlight ? "relative overflow-hidden" : ""}`}>
      {highlight && <div className="absolute inset-0 brand-gradient opacity-5" />}
      <div className="relative flex items-center justify-between">
        <div className="text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
          {label}
        </div>
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            highlight ? "brand-gradient text-black" : "bg-[var(--muted)]"
          }`}
        >
          {icon}
        </div>
      </div>
      <div className="relative mt-3 text-2xl font-bold">{value}</div>
    </div>
  );
}
