"use client";

import { Settings } from "lucide-react";

export default function SetupNotice() {
  return (
    <div className="card p-8 max-w-2xl mx-auto">
      <div className="brand-gradient w-12 h-12 rounded-lg flex items-center justify-center text-black mb-4">
        <Settings size={20} />
      </div>
      <h2 className="text-xl font-bold">Configure o Supabase</h2>
      <p className="text-sm text-[var(--muted-foreground)] mt-2">
        Para começar a usar o CRM Design, conecte um projeto Supabase. Isso
        leva 2 minutos.
      </p>
      <ol className="mt-4 space-y-2 text-sm list-decimal list-inside">
        <li>
          Crie um projeto em{" "}
          <a
            className="underline font-medium"
            href="https://supabase.com"
            target="_blank"
            rel="noreferrer"
          >
            supabase.com
          </a>
          .
        </li>
        <li>
          No SQL Editor, rode a migração de{" "}
          <code className="px-1 py-0.5 bg-[var(--muted)] rounded">
            supabase/migrations/0001_init.sql
          </code>
          .
        </li>
        <li>
          Crie um arquivo <code className="px-1 py-0.5 bg-[var(--muted)] rounded">.env.local</code>{" "}
          na raiz com:
          <pre className="mt-2 p-3 bg-[var(--muted)] rounded text-xs overflow-x-auto">
{`NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...`}
          </pre>
        </li>
        <li>Reinicie o servidor de desenvolvimento.</li>
      </ol>
    </div>
  );
}
