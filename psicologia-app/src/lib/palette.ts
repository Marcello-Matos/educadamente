// ════════════════════════════════════════════════════════════════════════
// Paleta de cores dos profissionais (estilo TimeTree)
// Usada na Agenda e no cadastro de Usuários. 24 cores distintas.
// As classes Tailwind aparecem como literais para o JIT gerá-las.
// ════════════════════════════════════════════════════════════════════════

export interface PaletteColor {
  id: string;
  bg: string;
  border: string;
  text: string;
  light: string;
  hex: string;
}

export const PRO_PALETTE: PaletteColor[] = [
  { id: "indigo",      bg: "bg-indigo-500",  border: "border-indigo-500",  text: "text-indigo-700",  light: "bg-indigo-50",  hex: "#6366f1" },
  { id: "violet",      bg: "bg-violet-500",  border: "border-violet-500",  text: "text-violet-700",  light: "bg-violet-50",  hex: "#8b5cf6" },
  { id: "purple",      bg: "bg-purple-500",  border: "border-purple-500",  text: "text-purple-700",  light: "bg-purple-50",  hex: "#a855f7" },
  { id: "fuchsia",     bg: "bg-fuchsia-500", border: "border-fuchsia-500", text: "text-fuchsia-700", light: "bg-fuchsia-50", hex: "#d946ef" },
  { id: "pink",        bg: "bg-pink-500",    border: "border-pink-500",    text: "text-pink-700",    light: "bg-pink-50",    hex: "#ec4899" },
  { id: "rose",        bg: "bg-rose-500",    border: "border-rose-500",    text: "text-rose-700",    light: "bg-rose-50",    hex: "#f43f5e" },
  { id: "red",         bg: "bg-red-500",     border: "border-red-500",     text: "text-red-700",     light: "bg-red-50",     hex: "#ef4444" },
  { id: "orange",      bg: "bg-orange-500",  border: "border-orange-500",  text: "text-orange-700",  light: "bg-orange-50",  hex: "#f97316" },
  { id: "amber",       bg: "bg-amber-500",   border: "border-amber-500",   text: "text-amber-700",   light: "bg-amber-50",   hex: "#f59e0b" },
  { id: "yellow",      bg: "bg-yellow-500",  border: "border-yellow-500",  text: "text-yellow-700",  light: "bg-yellow-50",  hex: "#eab308" },
  { id: "lime",        bg: "bg-lime-500",    border: "border-lime-500",    text: "text-lime-700",    light: "bg-lime-50",    hex: "#84cc16" },
  { id: "green",       bg: "bg-green-500",   border: "border-green-500",   text: "text-green-700",   light: "bg-green-50",   hex: "#22c55e" },
  { id: "emerald",     bg: "bg-emerald-500", border: "border-emerald-500", text: "text-emerald-700", light: "bg-emerald-50", hex: "#10b981" },
  { id: "teal",        bg: "bg-teal-500",    border: "border-teal-500",    text: "text-teal-700",    light: "bg-teal-50",    hex: "#14b8a6" },
  { id: "cyan",        bg: "bg-cyan-500",    border: "border-cyan-500",    text: "text-cyan-700",    light: "bg-cyan-50",    hex: "#06b6d4" },
  { id: "sky",         bg: "bg-sky-500",     border: "border-sky-500",     text: "text-sky-700",     light: "bg-sky-50",     hex: "#0ea5e9" },
  { id: "blue",        bg: "bg-blue-500",    border: "border-blue-500",    text: "text-blue-700",    light: "bg-blue-50",    hex: "#3b82f6" },
  { id: "indigo-dark", bg: "bg-indigo-800",  border: "border-indigo-800",  text: "text-indigo-800",  light: "bg-indigo-50",  hex: "#3730a3" },
  { id: "purple-dark", bg: "bg-purple-800",  border: "border-purple-800",  text: "text-purple-800",  light: "bg-purple-50",  hex: "#6b21a8" },
  { id: "rose-dark",   bg: "bg-rose-700",    border: "border-rose-700",    text: "text-rose-800",    light: "bg-rose-50",    hex: "#be123c" },
  { id: "orange-dark", bg: "bg-orange-700",  border: "border-orange-700",  text: "text-orange-800",  light: "bg-orange-50",  hex: "#c2410c" },
  { id: "green-dark",  bg: "bg-green-800",   border: "border-green-800",   text: "text-green-800",   light: "bg-green-50",   hex: "#166534" },
  { id: "teal-dark",   bg: "bg-teal-800",    border: "border-teal-800",    text: "text-teal-800",    light: "bg-teal-50",    hex: "#115e59" },
  { id: "blue-dark",   bg: "bg-blue-800",    border: "border-blue-800",    text: "text-blue-800",    light: "bg-blue-50",    hex: "#1e40af" },
];

export function getPaletteColor(id: string | null | undefined): PaletteColor {
  if (!id) return PRO_PALETTE[0];
  return PRO_PALETTE.find((c) => c.id === id) || PRO_PALETTE[0];
}
