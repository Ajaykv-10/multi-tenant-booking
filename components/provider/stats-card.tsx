export function StatsCard({
  title,
  value,
  subtitle,
  icon,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-start gap-4">
      <div className="w-12 h-12 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-medium text-slate-500 mb-1">{title}</h3>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        {subtitle && (
          <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
