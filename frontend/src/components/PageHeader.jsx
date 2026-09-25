import { ArrowRight } from "lucide-react";

function PageHeader({
  eyebrow,
  title,
  description,
  action,
  actionIcon: ActionIcon,
  onAction,
}) {
  return (
    <div className="mb-6 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
      <div>
        {eyebrow && (
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-lime-600">
            {eyebrow}
          </p>
        )}

        <h1 className="mt-2 text-2xl font-bold tracking-tight text-black sm:text-3xl">
          {title}
        </h1>

        {description && (
          <p className="mt-2 max-w-2xl text-xs font-medium leading-5 text-black sm:text-sm">
            {description}
          </p>
        )}
      </div>

      {action && (
        <button
          type="button"
          onClick={onAction}
          className="group inline-flex w-full items-center justify-center gap-2 rounded-xl border border-lime-300 bg-lime-50 px-4 py-2.5 text-xs font-semibold text-black transition hover:border-lime-400 hover:bg-lime-100 sm:w-auto"
        >
          {ActionIcon && (
            <ActionIcon className="h-4 w-4 text-lime-600" />
          )}

          <span>{action}</span>

          <ArrowRight className="h-3.5 w-3.5 text-black transition group-hover:translate-x-0.5" />
        </button>
      )}
    </div>
  );
}

export default PageHeader;