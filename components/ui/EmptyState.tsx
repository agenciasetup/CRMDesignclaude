import { AlertCircle } from "lucide-react";

export default function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="card p-10 text-center max-w-xl mx-auto">
      <div className="brand-gradient w-12 h-12 rounded-full mx-auto flex items-center justify-center text-black mb-4">
        <AlertCircle size={20} />
      </div>
      <div className="font-semibold text-lg">{title}</div>
      {description && (
        <p className="text-sm text-[var(--muted-foreground)] mt-2">{description}</p>
      )}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}
