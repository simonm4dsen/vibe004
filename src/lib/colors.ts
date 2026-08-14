export type MemberPalette = {
  chip: string;
  dot: string;
  text: string;
};

/**
 * Written as full literal class names so Tailwind picks them up when scanning.
 */
const PALETTES: MemberPalette[] = [
  {
    chip: "bg-indigo-500/15 text-indigo-800 dark:text-indigo-200 border-indigo-500/30",
    dot: "bg-indigo-500",
    text: "text-indigo-700 dark:text-indigo-300",
  },
  {
    chip: "bg-emerald-500/15 text-emerald-800 dark:text-emerald-200 border-emerald-500/30",
    dot: "bg-emerald-500",
    text: "text-emerald-700 dark:text-emerald-300",
  },
  {
    chip: "bg-amber-500/15 text-amber-800 dark:text-amber-200 border-amber-500/30",
    dot: "bg-amber-500",
    text: "text-amber-700 dark:text-amber-300",
  },
  {
    chip: "bg-rose-500/15 text-rose-800 dark:text-rose-200 border-rose-500/30",
    dot: "bg-rose-500",
    text: "text-rose-700 dark:text-rose-300",
  },
  {
    chip: "bg-sky-500/15 text-sky-800 dark:text-sky-200 border-sky-500/30",
    dot: "bg-sky-500",
    text: "text-sky-700 dark:text-sky-300",
  },
  {
    chip: "bg-violet-500/15 text-violet-800 dark:text-violet-200 border-violet-500/30",
    dot: "bg-violet-500",
    text: "text-violet-700 dark:text-violet-300",
  },
  {
    chip: "bg-teal-500/15 text-teal-800 dark:text-teal-200 border-teal-500/30",
    dot: "bg-teal-500",
    text: "text-teal-700 dark:text-teal-300",
  },
  {
    chip: "bg-orange-500/15 text-orange-800 dark:text-orange-200 border-orange-500/30",
    dot: "bg-orange-500",
    text: "text-orange-700 dark:text-orange-300",
  },
];

export function paletteFor(memberIds: string[], memberId: string): MemberPalette {
  const index = memberIds.indexOf(memberId);
  return PALETTES[(index < 0 ? 0 : index) % PALETTES.length];
}
