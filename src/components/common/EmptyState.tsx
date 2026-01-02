interface EmptyStateProps {
  title: string;
  description?: string;
}

export default function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="flex h-[40vh] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/50">
      <p className="text-slate-600 dark:text-slate-400">{title}</p>
      {description && (
        <p className="text-sm text-slate-500 dark:text-slate-500">{description}</p>
      )}
    </div>
  );
}
