import { LoaderCircle } from "lucide-react";

function Button({
  children,
  type = "button",
  variant = "primary",
  loading = false,
  onClick,
  className = "",
}) {
  const variants = {
    primary:
      "bg-lime-300 text-[#08100c] hover:bg-lime-200 shadow-lg shadow-lime-300/10",

    secondary:
      "border border-white/[0.08] bg-white/[0.035] text-white/70 hover:bg-white/[0.06] hover:text-white",

    danger:
      "border border-red-400/20 bg-red-400/[0.05] text-red-300 hover:bg-red-400/[0.1]",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading}
      className={`flex min-h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
    >
      {loading && (
        <LoaderCircle className="h-4 w-4 animate-spin" />
      )}

      {children}
    </button>
  );
}

export default Button;