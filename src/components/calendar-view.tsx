"use client";

import { useMemo, useState } from "react";

import { useMounted } from "@/components/use-mounted";
import { paletteFor } from "@/lib/colors";
import type { AppointmentDTO, MemberDTO } from "@/lib/data";
import {
  addDays,
  addMonths,
  dayKey,
  daysBetween,
  formatTime,
  isSameDay,
  startOfMonth,
  startOfWeek,
} from "@/lib/datetime";

type Mode = "week" | "month";

function buildDayIndex(appointments: AppointmentDTO[]) {
  const index = new Map<string, AppointmentDTO[]>();

  for (const appointment of appointments) {
    const keys = daysBetween(
      new Date(appointment.startsAt),
      new Date(appointment.endsAt),
    );

    for (const key of keys) {
      const bucket = index.get(key);
      if (bucket) bucket.push(appointment);
      else index.set(key, [appointment]);
    }
  }

  return index;
}

function Chip({
  appointment,
  day,
  memberIds,
  withMember,
}: {
  appointment: AppointmentDTO;
  day: Date;
  memberIds: string[];
  withMember: boolean;
}) {
  const palette = paletteFor(memberIds, appointment.memberId);
  const start = new Date(appointment.startsAt);
  const continues = !isSameDay(start, day);

  return (
    <div
      className={`truncate rounded-md border px-1.5 py-1 text-[11px] leading-tight ${palette.chip}`}
      title={`${appointment.title} — ${appointment.memberName}`}
    >
      <span className="font-medium">
        {continues ? "↪ " : `${formatTime(start)} `}
      </span>
      {appointment.title}
      {withMember ? (
        <span className="block truncate opacity-70">{appointment.memberName}</span>
      ) : null}
    </div>
  );
}

export function CalendarView({
  appointments,
  members,
}: {
  appointments: AppointmentDTO[];
  members: MemberDTO[];
}) {
  const mounted = useMounted();
  const [mode, setMode] = useState<Mode>("week");
  const [offset, setOffset] = useState(0);

  const memberIds = useMemo(() => members.map((member) => member.id), [members]);
  const index = useMemo(() => buildDayIndex(appointments), [appointments]);

  if (!mounted) {
    return (
      <div
        className="h-72 animate-pulse rounded-lg bg-black/5 dark:bg-white/5"
        aria-hidden
      />
    );
  }

  const today = new Date();
  const anchor =
    mode === "week"
      ? addDays(startOfWeek(today), offset * 7)
      : addMonths(startOfMonth(today), offset);

  const heading =
    mode === "week"
      ? `${anchor.toLocaleDateString(undefined, {
          day: "numeric",
          month: "short",
        })} – ${addDays(anchor, 6).toLocaleDateString(undefined, {
          day: "numeric",
          month: "short",
          year: "numeric",
        })}`
      : anchor.toLocaleDateString(undefined, { month: "long", year: "numeric" });

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="btn-secondary px-2 py-1"
            onClick={() => setOffset((value) => value - 1)}
            aria-label="Previous period"
          >
            ←
          </button>
          <button
            type="button"
            className="btn-secondary px-3 py-1 text-xs"
            onClick={() => setOffset(0)}
          >
            Today
          </button>
          <button
            type="button"
            className="btn-secondary px-2 py-1"
            onClick={() => setOffset((value) => value + 1)}
            aria-label="Next period"
          >
            →
          </button>
          <span className="ml-2 font-medium">{heading}</span>
        </div>

        <div className="inline-flex rounded-lg border border-black/10 p-1 dark:border-white/10">
          {(["week", "month"] as Mode[]).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                setMode(value);
                setOffset(0);
              }}
              className={`rounded-md px-3 py-1 text-sm font-medium capitalize transition ${
                mode === value
                  ? "bg-indigo-600 text-white"
                  : "hover:bg-black/5 dark:hover:bg-white/10"
              }`}
            >
              {value}
            </button>
          ))}
        </div>
      </div>

      {mode === "week" ? (
        <WeekGrid
          weekStart={anchor}
          members={members}
          memberIds={memberIds}
          index={index}
          today={today}
        />
      ) : (
        <MonthGrid
          monthStart={anchor}
          memberIds={memberIds}
          index={index}
          today={today}
        />
      )}

      <ul className="mt-4 flex flex-wrap gap-3">
        {members.map((member) => {
          const palette = paletteFor(memberIds, member.id);
          return (
            <li key={member.id} className="flex items-center gap-1.5 text-sm">
              <span
                className={`h-2.5 w-2.5 rounded-full ${palette.dot}`}
                aria-hidden
              />
              {member.displayName}
              {member.isSelf ? <span className="muted">(you)</span> : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function WeekGrid({
  weekStart,
  members,
  memberIds,
  index,
  today,
}: {
  weekStart: Date;
  members: MemberDTO[];
  memberIds: string[];
  index: Map<string, AppointmentDTO[]>;
  today: Date;
}) {
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] table-fixed border-collapse">
        <thead>
          <tr>
            <th className="w-32 border-b border-black/10 p-2 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:border-white/10">
              Member
            </th>
            {days.map((day) => (
              <th
                key={dayKey(day)}
                className={`border-b border-black/10 p-2 text-center text-xs font-semibold dark:border-white/10 ${
                  isSameDay(day, today) ? "text-indigo-600 dark:text-indigo-400" : ""
                }`}
              >
                <span className="block uppercase tracking-wide text-neutral-500">
                  {day.toLocaleDateString(undefined, { weekday: "short" })}
                </span>
                <span className="text-base">{day.getDate()}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {members.map((member) => (
            <tr key={member.id} className="align-top">
              <th className="border-b border-black/5 p-2 text-left text-sm font-medium dark:border-white/5">
                <span className="flex items-center gap-1.5">
                  <span
                    className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                      paletteFor(memberIds, member.id).dot
                    }`}
                    aria-hidden
                  />
                  <span className="truncate">{member.displayName}</span>
                </span>
              </th>
              {days.map((day) => {
                const items = (index.get(dayKey(day)) ?? []).filter(
                  (appointment) => appointment.memberId === member.id,
                );

                return (
                  <td
                    key={dayKey(day)}
                    className={`border-b border-black/5 p-1 dark:border-white/5 ${
                      isSameDay(day, today) ? "bg-indigo-500/5" : ""
                    }`}
                  >
                    <div className="space-y-1">
                      {items.map((appointment) => (
                        <Chip
                          key={`${appointment.id}-${dayKey(day)}`}
                          appointment={appointment}
                          day={day}
                          memberIds={memberIds}
                          withMember={false}
                        />
                      ))}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MonthGrid({
  monthStart,
  memberIds,
  index,
  today,
}: {
  monthStart: Date;
  memberIds: string[];
  index: Map<string, AppointmentDTO[]>;
  today: Date;
}) {
  const gridStart = startOfWeek(monthStart);
  const monthEnd = addDays(addMonths(monthStart, 1), -1);
  const totalDays =
    Math.round(
      (startOfWeek(monthEnd).getTime() - gridStart.getTime()) / (24 * 60 * 60 * 1000),
    ) + 7;
  const days = Array.from({ length: totalDays }, (_, i) => addDays(gridStart, i));
  const weekdayLabels = days.slice(0, 7);

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[640px]">
        <div className="grid grid-cols-7 gap-px">
          {weekdayLabels.map((day) => (
            <div
              key={`label-${dayKey(day)}`}
              className="p-2 text-center text-xs font-semibold uppercase tracking-wide text-neutral-500"
            >
              {day.toLocaleDateString(undefined, { weekday: "short" })}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-px rounded-lg bg-black/10 dark:bg-white/10">
          {days.map((day) => {
            const items = index.get(dayKey(day)) ?? [];
            const inMonth = day.getMonth() === monthStart.getMonth();

            return (
              <div
                key={dayKey(day)}
                className={`min-h-24 bg-white p-1.5 dark:bg-neutral-950 ${
                  inMonth ? "" : "opacity-45"
                }`}
              >
                <div
                  className={`mb-1 text-right text-xs ${
                    isSameDay(day, today)
                      ? "font-semibold text-indigo-600 dark:text-indigo-400"
                      : "text-neutral-500"
                  }`}
                >
                  {day.getDate()}
                </div>
                <div className="space-y-1">
                  {items.slice(0, 3).map((appointment) => (
                    <Chip
                      key={`${appointment.id}-${dayKey(day)}`}
                      appointment={appointment}
                      day={day}
                      memberIds={memberIds}
                      withMember
                    />
                  ))}
                  {items.length > 3 ? (
                    <div className="px-1 text-[11px] text-neutral-500">
                      +{items.length - 3} more
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
