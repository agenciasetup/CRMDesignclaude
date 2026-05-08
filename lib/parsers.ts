"use client";

import Papa from "papaparse";
import * as XLSX from "xlsx";

export type ParsedTable = {
  headers: string[];
  rows: Record<string, string>[];
};

export async function parseFile(file: File): Promise<ParsedTable> {
  const name = file.name.toLowerCase();
  if (name.endsWith(".csv") || file.type === "text/csv") {
    return parseCsv(file);
  }
  if (
    name.endsWith(".xlsx") ||
    name.endsWith(".xls") ||
    file.type.includes("spreadsheet") ||
    file.type.includes("excel")
  ) {
    return parseXlsx(file);
  }
  // Try CSV as fallback
  return parseCsv(file);
}

function parseCsv(file: File): Promise<ParsedTable> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim(),
      complete: (result) => {
        const headers = result.meta.fields ?? [];
        const rows = (result.data || []).map((r) => {
          const out: Record<string, string> = {};
          for (const h of headers) out[h] = String(r[h] ?? "").trim();
          return out;
        });
        resolve({ headers, rows });
      },
      error: (err) => reject(err),
    });
  });
}

async function parseXlsx(file: File): Promise<ParsedTable> {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });
  const sheetName = wb.SheetNames[0];
  const ws = wb.Sheets[sheetName];
  const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, {
    defval: "",
    raw: false,
  });
  const headers = json.length > 0 ? Object.keys(json[0]).map((h) => h.trim()) : [];
  const rows: Record<string, string>[] = json.map((r) => {
    const out: Record<string, string> = {};
    for (const h of headers) out[h] = String((r as Record<string, unknown>)[h] ?? "").trim();
    return out;
  });
  return { headers, rows };
}

import { LEAD_FIELDS } from "./constants";

export function autoDetectMapping(headers: string[]): Record<string, string> {
  const mapping: Record<string, string> = {};
  const norm = (s: string) =>
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, "");
  for (const field of LEAD_FIELDS) {
    const aliases = [field.key, field.label, ...field.aliases].map(norm);
    const match = headers.find((h) => aliases.includes(norm(h)));
    if (match) mapping[field.key] = match;
  }
  return mapping;
}
