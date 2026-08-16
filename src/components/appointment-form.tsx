"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";

import {
  createAppointmentAction,
  updateAppointmentAction,
} from "@/app/actions/appointments";
import { SubmitButton } from "@/components/submit-button";
import { emptyActionState } from "@/lib/action-state";
import { addDays, toDateTimeLocalValue } from "@/lib/datetime";

export type AppointmentFormValues = {
  id: string;
  title: string;
  /** ISO timestamps; converted to local input values after mount. */
  startsAt: string;
  endsAt: string;
};

function defaultTimes(): { start: string; end: string } {
  const start = addDays(new Date(), 1);
  start.setHours(18, 0, 0, 0);
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
  return { start: toDateTimeLocalValue(start), end: toDateTimeLocalValue(end) };
}

export function AppointmentForm({
  groupName,
  appointment,
}: {
  groupName: string;
  appointment?: AppointmentFormValues;
}) {
  const isEdit = Boolean(appointment);
  const [state, formAction] = useActionState(
    isEdit ? updateAppointmentAction : createAppointmentAction,
    emptyActionState,
  );

  const [title, setTitle] = useState(appointment?.title ?? "");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [justSaved, setJustSaved] = useState(false);

  const appointmentId = appointment?.id;
  const appointmentStart = appointment?.startsAt;
  const appointmentEnd = appointment?.endsAt;

  // Date fields are filled in after mount: only the browser knows the user's
  // timezone, so doing this during render would break hydration.
  useEffect(() => {
    if (appointmentStart && appointmentEnd) {
      setStartsAt(toDateTimeLocalValue(new Date(appointmentStart)));
      setEndsAt(toDateTimeLocalValue(new Date(appointmentEnd)));
      return;
    }

    const { start, end } = defaultTimes();
    setStartsAt((current) => current || start);
    setEndsAt((current) => current || end);
  }, [appointmentId, appointmentStart, appointmentEnd]);

  useEffect(() => {
    if (isEdit || !state.ok) return;
    const { start, end } = defaultTimes();
    setTitle("");
    setStartsAt(start);
    setEndsAt(end);
    setJustSaved(true);

    const timer = setTimeout(() => setJustSaved(false), 4000);
    return () => clearTimeout(timer);
  }, [isEdit, state.ok]);

  function handleStartChange(value: string) {
    setStartsAt(value);
    const start = new Date(value);
    const end = new Date(endsAt);

    if (!Number.isNaN(start.getTime()) && !(end > start)) {
      setEndsAt(
        toDateTimeLocalValue(new Date(start.getTime() + 2 * 60 * 60 * 1000)),
      );
    }
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="groupName" value={groupName} />
      {appointment ? (
        <input type="hidden" name="appointmentId" value={appointment.id} />
      ) : null}

      {state.error ? <p className="form-error">{state.error}</p> : null}

      <div>
        <label className="label" htmlFor="title">
          What is it?
        </label>
        <input
          id="title"
          name="title"
          required
          maxLength={100}
          className="input"
          placeholder="Dinner with Sam"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="min-w-0">
          <label className="label" htmlFor="startsAt">
            Starts
          </label>
          <input
            id="startsAt"
            name="startsAt"
            type="datetime-local"
            required
            className="input w-full min-w-0"
            value={startsAt}
            onChange={(event) => handleStartChange(event.target.value)}
          />
        </div>
        <div className="min-w-0">
          <label className="label" htmlFor="endsAt">
            Ends
          </label>
          <input
            id="endsAt"
            name="endsAt"
            type="datetime-local"
            required
            className="input w-full min-w-0"
            value={endsAt}
            onChange={(event) => setEndsAt(event.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <SubmitButton pendingLabel={isEdit ? "Saving…" : "Adding…"}>
          {isEdit ? "Save changes" : "Add appointment"}
        </SubmitButton>
        {isEdit ? (
          <Link href={`/groups/${groupName}`} className="btn-secondary">
            Cancel
          </Link>
        ) : null}
        {!isEdit && justSaved ? (
          <span className="muted" role="status">
            Added ✓
          </span>
        ) : null}
      </div>
    </form>
  );
}
