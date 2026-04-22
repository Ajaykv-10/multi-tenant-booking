type Status = "CONFIRMED" | "CANCELLED" | "ADMIN" | "PROVIDER" | "CUSTOMER";

const styleMap: Record<Status, string> = {
  CONFIRMED: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  CANCELLED: "bg-red-50 text-red-600 ring-red-600/20",
  ADMIN: "bg-indigo-50 text-indigo-700 ring-indigo-600/20",
  PROVIDER: "bg-violet-50 text-violet-700 ring-violet-600/20",
  CUSTOMER: "bg-slate-100 text-slate-600 ring-slate-500/20",
};

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ring-inset ${styleMap[status]} ${className}`}
    >
      {status === "CONFIRMED" && (
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 shrink-0" />
      )}
      {status === "CANCELLED" && (
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5 shrink-0" />
      )}
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}
