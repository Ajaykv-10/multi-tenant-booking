interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  accent: "indigo" | "violet" | "blue" | "emerald";
  sub?: string;
}

const accentMap = {
  indigo: {
    iconBg: "bg-indigo-50",
    iconText: "text-indigo-600",
    valueBg: "from-indigo-600 to-indigo-500",
  },
  violet: {
    iconBg: "bg-violet-50",
    iconText: "text-violet-600",
    valueBg: "from-violet-600 to-violet-500",
  },
  blue: {
    iconBg: "bg-blue-50",
    iconText: "text-blue-600",
    valueBg: "from-blue-600 to-blue-500",
  },
  emerald: {
    iconBg: "bg-emerald-50",
    iconText: "text-emerald-600",
    valueBg: "from-emerald-600 to-emerald-500",
  },
};

export function StatsCard({ title, value, icon, accent, sub }: StatsCardProps) {
  const colors = accentMap[accent];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">{value}</p>
          {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
        </div>
        <div className={`w-12 h-12 rounded-xl ${colors.iconBg} ${colors.iconText} flex items-center justify-center shrink-0`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
