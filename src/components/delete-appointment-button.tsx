"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { deleteAppointmentAction } from "@/app/actions/appointments";
import { emptyActionState } from "@/lib/action-state";

function Button({ title }: { title: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className="btn-danger px-2 py-1 text-xs"
      disabled={pending}
      aria-label={`Delete ${title}`}
    >
      {pending ? "Deleting…" : "Delete"}
    </button>
  );
}

export function DeleteAppointmentButton({
  groupName,
  appointmentId,
  title,
}: {
  groupName: string;
  appointmentId: string;
  title: string;
}) {
  const [state, formAction] = useActionState(
    deleteAppointmentAction,
    emptyActionState,
  );

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        if (!window.confirm(`Delete “${title}”?`)) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="groupName" value={groupName} />
      <input type="hidden" name="appointmentId" value={appointmentId} />
      <Button title={title} />
      {state.error ? (
        <span className="ml-2 text-xs text-red-600">{state.error}</span>
      ) : null}
    </form>
  );
}
