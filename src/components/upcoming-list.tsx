"use client";

import Link from "next/link";

import { DeleteAppointmentButton } from "@/components/delete-appointment-button";
import { useMounted } from "@/components/use-mounted";
import type { AppointmentDTO } from "@/lib/data";
import { paletteFor } from "@/lib/colors";
import {
  dayKey,
  formatDate,
  formatRange,
  isSameDay,
  relativeDayLabel,
} from "@/lib/datetime";

type Props = {
  groupName: string;
  appointments: AppointmentDTO[];
  memberIds: string[];
  onlyMine?: boolean;
};

export function UpcomingList({
  groupName,
  appointments,
  memberIds,
  onlyMine = false,
}: Props) {
  const mounted = useMounted();

  if (!mounted) {
    return (
      <div className="space-y-2" aria-hidden>
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            className="h-16 animate-pulse rounded-lg bg-black/5 dark:bg-white/5"
          />
        ))}
      </div>
    );
  }

  const now = new Date();
  const visible = appointments
    .filter((appointment) => new Date(appointment.endsAt) >= now)
    .filter((appointment) => (onlyMine ? appointment.isOwn : true));

  if (visible.length === 0) {
    return (
      <p className="muted">
        {onlyMine
          ? "You have no upcoming appointments in this group yet."
          : "Nothing planned yet. Add the first appointment above."}
      </p>
    );
  }

  const days = new Map<string, AppointmentDTO[]>();
  for (const appointment of visible) {
    const key = dayKey(new Date(appointment.startsAt));
    const bucket = days.get(key);
    if (bucket) bucket.push(appointment);
    else days.set(key, [appointment]);
  }

  return (
    <ol className="space-y-5">
      {[...days.entries()].map(([key, items]) => {
        const date = new Date(items[0].startsAt);
        const relative = relativeDayLabel(date, now);

        return (
          <li key={key}>
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-neutral-500">
              {formatDate(date)}
              {relative ? (
                <span className="ml-2 font-normal normal-case text-indigo-600 dark:text-indigo-400">
                  {relative}
                </span>
              ) : null}
            </h3>
            <ul className="space-y-2">
              {items.map((appointment) => {
                const start = new Date(appointment.startsAt);
                const end = new Date(appointment.endsAt);
                const palette = paletteFor(memberIds, appointment.memberId);

                return (
                  <li
                    key={appointment.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-black/10 bg-white px-4 py-3 dark:border-white/10 dark:bg-white/5"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-2.5 w-2.5 shrink-0 rounded-full ${palette.dot}`}
                          aria-hidden
                        />
                        <span className="truncate font-medium">
                          {appointment.title}
                        </span>
                        {appointment.isOwn ? (
                          <span className="rounded-full bg-black/5 px-2 py-0.5 text-xs text-neutral-600 dark:bg-white/10 dark:text-neutral-300">
                            you
                          </span>
                        ) : null}
                      </div>
                      <p className="muted mt-0.5">
                        <span className={palette.text}>{appointment.memberName}</span>
                        {" · "}
                        {isSameDay(start, end)
                          ? formatRange(start, end).split(" · ")[1]
                          : formatRange(start, end)}
                      </p>
                    </div>

                    {appointment.isOwn ? (
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/groups/${groupName}/appointments/${appointment.id}/edit`}
                          className="btn-secondary px-2 py-1 text-xs"
                        >
                          Edit
                        </Link>
                        <DeleteAppointmentButton
                          groupName={groupName}
                          appointmentId={appointment.id}
                          title={appointment.title}
                        />
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </li>
        );
      })}
    </ol>
  );
}
