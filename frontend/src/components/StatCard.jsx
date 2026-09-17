function StatCard({
  title,
  value,
  change,
  description,
  icon: Icon,
}) {
  return (
    <div className="ff-card ff-card-hover rounded-2xl p-5">
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-lime-300/10 bg-lime-300/[0.06]">
          <Icon className="h-4.5 w-4.5 text-lime-300" />
        </div>

        {change && (
          <span className="rounded-full bg-lime-300/10 px-2 py-1 text-[10px] font-semibold text-lime-300">
            {change}
          </span>
        )}
      </div>

      <p className="mt-5 text-xs text-white/35">
        {title}
      </p>

      <div className="mt-1 flex items-end gap-2">
        <p className="text-2xl font-bold tracking-tight">
          {value}
        </p>

        {description && (
          <p className="mb-1 text-[10px] text-white/25">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

export default StatCard;