"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Upload, CheckCircle2, AlertTriangle, FileSpreadsheet } from "lucide-react";
import { parseFile, autoDetectMapping, ParsedTable } from "@/lib/parsers";
import { LEAD_FIELDS } from "@/lib/constants";
import { bulkInsertLeads } from "@/lib/api";
import type { Lead, Stage } from "@/lib/types";

type Step = "upload" | "map" | "done";

export default function ImportWizard() {
  const [step, setStep] = useState<Step>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [table, setTable] = useState<ParsedTable | null>(null);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [importing, setImporting] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [result, setResult] = useState<{ inserted: number; total: number } | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const previewRows = useMemo(() => table?.rows.slice(0, 10) ?? [], [table]);

  async function handleFile(f: File) {
    setErr(null);
    setFile(f);
    try {
      const parsed = await parseFile(f);
      if (parsed.headers.length === 0) {
        throw new Error("Não foi possível identificar colunas no arquivo.");
      }
      setTable(parsed);
      setMapping(autoDetectMapping(parsed.headers));
      setStep("map");
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Erro ao ler o arquivo.");
    }
  }

  async function handleImport() {
    if (!table) return;
    setImporting(true);
    setErr(null);
    try {
      const leads: Partial<Lead>[] = table.rows.map((row) => {
        const get = (key: string) => {
          const col = mapping[key];
          if (!col) return "";
          return (row[col] ?? "").trim();
        };
        const tagsRaw = get("tags");
        const valueRaw = get("estimated_value").replace(/[^0-9.,-]/g, "").replace(",", ".");
        const probRaw = get("probability").replace(/[^0-9]/g, "");
        return {
          name: get("name") || "Sem nome",
          email: get("email") || null,
          phone: get("phone") || null,
          company: get("company") || null,
          instagram: get("instagram") || null,
          source: get("source") || null,
          tags: tagsRaw
            ? tagsRaw
                .split(/[,;|]/)
                .map((t) => t.trim())
                .filter(Boolean)
            : [],
          estimated_value: valueRaw ? Number(valueRaw) : null,
          probability: probRaw ? Math.min(100, Math.max(0, Number(probRaw))) : null,
          notes: get("notes") || null,
          stage: "novo_lead" as Stage,
        };
      });
      const filtered = leads.filter((l) => l.name && l.name !== "Sem nome");
      const toInsert = filtered.length > 0 ? filtered : leads;
      const inserted = await bulkInsertLeads(toInsert);
      setResult({ inserted, total: toInsert.length });
      setStep("done");
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Erro na importação.");
    } finally {
      setImporting(false);
    }
  }

  function reset() {
    setFile(null);
    setTable(null);
    setMapping({});
    setStep("upload");
    setResult(null);
    setErr(null);
  }

  if (step === "done" && result) {
    return (
      <div className="card p-8 max-w-xl mx-auto text-center">
        <div className="brand-gradient w-14 h-14 rounded-full flex items-center justify-center text-black mx-auto mb-4">
          <CheckCircle2 size={24} />
        </div>
        <h2 className="text-xl font-bold">Importação concluída</h2>
        <p className="text-sm text-[var(--muted-foreground)] mt-2">
          {result.inserted} de {result.total} leads importados com sucesso.
        </p>
        <div className="mt-5 flex gap-2 justify-center">
          <button onClick={reset} className="btn-ghost">
            Importar outro arquivo
          </button>
          <Link href="/pipeline" className="btn-primary">
            Ver no pipeline
          </Link>
        </div>
      </div>
    );
  }

  if (step === "map" && table) {
    return (
      <div className="space-y-5">
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-1">
            <FileSpreadsheet size={18} />
            <div className="font-semibold">{file?.name}</div>
            <div className="text-xs text-[var(--muted-foreground)]">
              {table.rows.length} linhas · {table.headers.length} colunas
            </div>
          </div>
          <p className="text-sm text-[var(--muted-foreground)]">
            Mapeie as colunas do arquivo para os campos do lead. Apenas o campo{" "}
            <strong>Nome</strong> é obrigatório.
          </p>
        </div>

        <div className="card p-5 space-y-3">
          <h3 className="font-semibold">Mapeamento de colunas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {LEAD_FIELDS.map((f) => (
              <div key={f.key} className="flex items-center gap-2">
                <div className="w-44 text-sm font-medium">
                  {f.label}
                  {f.key === "name" && <span className="text-red-500"> *</span>}
                </div>
                <select
                  className="input"
                  value={mapping[f.key] ?? ""}
                  onChange={(e) =>
                    setMapping((m) => ({ ...m, [f.key]: e.target.value }))
                  }
                >
                  <option value="">— Ignorar —</option>
                  {table.headers.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <h3 className="font-semibold mb-3">
            Pré-visualização ({Math.min(10, table.rows.length)} primeiras linhas)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-[var(--muted)]">
                <tr>
                  {table.headers.map((h) => (
                    <th key={h} className="text-left px-3 py-1.5 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {previewRows.map((r, i) => (
                  <tr key={i} className="border-t border-[var(--border)]">
                    {table.headers.map((h) => (
                      <td key={h} className="px-3 py-1.5 whitespace-nowrap">
                        {r[h] || <span className="text-[var(--muted-foreground)]">—</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {err && (
          <div className="px-4 py-2 rounded bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
            <AlertTriangle size={16} /> {err}
          </div>
        )}

        <div className="flex justify-between gap-2">
          <button onClick={reset} className="btn-ghost">
            Voltar
          </button>
          <button
            onClick={handleImport}
            disabled={importing || !mapping.name}
            className="btn-primary"
          >
            {importing
              ? "Importando..."
              : `Importar ${table.rows.length} lead${table.rows.length === 1 ? "" : "s"}`}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-8 max-w-2xl mx-auto">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const f = e.dataTransfer.files?.[0];
          if (f) handleFile(f);
        }}
        className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors ${
          dragOver ? "border-[var(--brand-yellow)] bg-[#fff7e6]" : "border-[var(--border)]"
        }`}
      >
        <div className="brand-gradient w-14 h-14 rounded-full flex items-center justify-center text-black mx-auto mb-4">
          <Upload size={24} />
        </div>
        <div className="font-semibold">Arraste o arquivo aqui</div>
        <div className="text-sm text-[var(--muted-foreground)] mt-1">
          Suporta CSV, XLS e XLSX. Os leads importados entram no estágio “Novo Lead”.
        </div>
        <label className="btn-primary mt-5 cursor-pointer">
          Selecionar arquivo
          <input
            type="file"
            accept=".csv,.xls,.xlsx,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />
        </label>
      </div>
      {err && (
        <div className="mt-4 px-4 py-2 rounded bg-red-50 border border-red-200 text-red-700 text-sm">
          {err}
        </div>
      )}
      <div className="mt-6 text-xs text-[var(--muted-foreground)]">
        Dica: a primeira linha do arquivo deve conter os cabeçalhos (ex.: Nome, E-mail,
        Telefone, Empresa, Instagram, Tags...). O CRM tenta detectar o mapeamento
        automaticamente.
      </div>
    </div>
  );
}
