"use client";

import ImportWizard from "@/components/ImportWizard";
import PageHeader from "@/components/ui/PageHeader";
import SetupNotice from "@/components/ui/SetupNotice";
import { hasSupabaseConfig } from "@/lib/supabase";

export default function ImportPage() {
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
        title="Importar leads"
        description="Carregue um arquivo CSV ou Excel para adicionar leads em lote."
      />
      <div className="px-8 pb-12">
        <ImportWizard />
      </div>
    </div>
  );
}
