"use client";

import { useState, FormEvent } from "react";
import type { Lead, Stage } from "@/lib/types";
import { PIPELINE_STAGES, LEAD_SOURCES } from "@/lib/constants";

export type LeadFormValues = Partial<Lead>;

export default function LeadForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel = "Salvar",
}: {
  initial?: LeadFormValues;
  onSubmit: (values: LeadFormValues) => Promise<void> | void;
  onCancel?: () => void;
  submitLabel?: string;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [company, setCompany] = useState(initial?.company ?? "");
  const [instagram, setInstagram] = useState(initial?.instagram ?? "");
  const [stage, setStage] = useState<Stage>((initial?.stage as Stage) ?? "prospeccao");
  const [source, setSource] = useState(initial?.source ?? "");
  const [tagsInput, setTagsInput] = useState((initial?.tags ?? []).join(", "));
  const [estimatedValue, setEstimatedValue] = useState<string>(
    initial?.estimated_value != null ? String(initial.estimated_value) : ""
  );
  const [probability, setProbability] = useState<string>(
    initial?.probability != null ? String(initial.probability) : ""
  );
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErr(null);
    try {
      const tags = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      await onSubmit({
        name: name.trim() || "Sem identificação",
        email: email.trim() || null,
        phone: phone.trim() || null,
        company: company.trim() || null,
        instagram: instagram.trim() || null,
        stage,
        source: source.trim() || null,
        tags,
        estimated_value: estimatedValue ? Number(estimatedValue) : null,
        probability: probability ? Number(probability) : null,
        notes: notes.trim() || null,
      });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Erro ao salvar.";
      setErr(msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Razão social / Contato" required>
          <input
            className="input"
            value={name ?? ""}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </Field>
        <Field label="Empresa / CNPJ">
          <input
            className="input"
            value={company ?? ""}
            onChange={(e) => setCompany(e.target.value)}
          />
        </Field>
        <Field label="E-mail corporativo">
          <input
            className="input"
            type="email"
            value={email ?? ""}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>
        <Field label="Telefone / WhatsApp">
          <input
            className="input"
            value={phone ?? ""}
            onChange={(e) => setPhone(e.target.value)}
          />
        </Field>
        <Field label="Perfil online (LinkedIn, site, @)">
          <input
            className="input"
            placeholder="linkedin.com/in/... ou @perfil"
            value={instagram ?? ""}
            onChange={(e) => setInstagram(e.target.value)}
          />
        </Field>
        <Field label="Origem">
          <input
            className="input"
            list="lead-sources"
            value={source ?? ""}
            onChange={(e) => setSource(e.target.value)}
            placeholder="ex: Indicação, LinkedIn, OAB"
          />
          <datalist id="lead-sources">
            {LEAD_SOURCES.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </Field>
        <Field label="Estágio">
          <select
            className="input"
            value={stage}
            onChange={(e) => setStage(e.target.value as Stage)}
          >
            {PIPELINE_STAGES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Áreas de atuação / Tags">
          <input
            className="input"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="trabalhista, tributário, contratos"
          />
        </Field>
        <Field label="Honorários estimados (R$)">
          <input
            className="input"
            type="number"
            step="0.01"
            value={estimatedValue}
            onChange={(e) => setEstimatedValue(e.target.value)}
          />
        </Field>
        <Field label="Probabilidade de contratação (%)">
          <input
            className="input"
            type="number"
            min={0}
            max={100}
            value={probability}
            onChange={(e) => setProbability(e.target.value)}
          />
        </Field>
      </div>
      <Field label="Observações">
        <textarea
          className="input min-h-24"
          value={notes ?? ""}
          onChange={(e) => setNotes(e.target.value)}
        />
      </Field>
      {err && <div className="text-sm text-red-600">{err}</div>}
      <div className="flex gap-2 justify-end pt-2">
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-ghost">
            Cancelar
          </button>
        )}
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? "Salvando..." : submitLabel}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-[var(--muted-foreground)]">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
