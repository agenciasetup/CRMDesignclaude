"use client";

import Link from "next/link";
import { Plus, Upload } from "lucide-react";
import PipelineBoard from "@/components/PipelineBoard";
import PageHeader from "@/components/ui/PageHeader";
import SetupNotice from "@/components/ui/SetupNotice";
import { hasSupabaseConfig } from "@/lib/supabase";

export default function PipelinePage() {
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
        title="Pipeline de prospecção"
        description="Acompanhe a evolução de cada cliente potencial. Arraste os cartões entre as fases para atualizar o estágio."
        actions={
          <>
            <Link href="/leads/import" className="btn-ghost">
              <Upload size={16} />
              Importar
            </Link>
            <Link href="/leads?new=1" className="btn-primary">
              <Plus size={16} />
              Novo cliente potencial
            </Link>
          </>
        }
      />
      <PipelineBoard />
    </div>
  );
}
