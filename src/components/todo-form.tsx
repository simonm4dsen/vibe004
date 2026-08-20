"use client";

import { useActionState, useEffect, useState } from "react";

import { createTodoAction } from "@/app/actions/todos";
import { SubmitButton } from "@/components/submit-button";
import { emptyActionState } from "@/lib/action-state";

export function TodoForm({ groupName }: { groupName: string }) {
  const [state, formAction] = useActionState(createTodoAction, emptyActionState);
  const [title, setTitle] = useState("");

  useEffect(() => {
    if (!state.ok) return;
    setTitle("");
  }, [state.ok]);

  return (
    <form action={formAction} className="flex flex-wrap items-start gap-3">
      <input type="hidden" name="groupName" value={groupName} />

      <div className="min-w-0 flex-1">
        <label className="sr-only" htmlFor="todo-title">
          To-do item
        </label>
        <input
          id="todo-title"
          name="title"
          required
          maxLength={140}
          className="input w-full"
          placeholder="Buy milk"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
        {state.error ? <p className="form-error mt-1">{state.error}</p> : null}
      </div>

      <SubmitButton pendingLabel="Adding…">Add item</SubmitButton>
    </form>
  );
}
