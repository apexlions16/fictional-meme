interface StatCardProps {
  label: string;
  value: string | number;
  detail: string;
  icon: string;
}

export function StatCard({ label, value, detail, icon }: StatCardProps) {
  return (
    <article className="stat-card">
      <span className="stat-icon">{icon}</span>
      <div><p>{label}</p><strong>{value}</strong><small>{detail}</small></div>
    </article>
  );
}
