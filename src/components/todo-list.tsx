"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { completeTodoAction } from "@/app/actions/todos";
import { useMounted } from "@/components/use-mounted";
import { emptyActionState } from "@/lib/action-state";
import type { TodoDTO } from "@/lib/data";

function CompleteButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" className="btn-secondary px-2 py-1 text-xs" disabled={pending}>
      {pending ? "Saving…" : "Done"}
    </button>
  );
}

function TodoRow({ groupName, item }: { groupName: string; item: TodoDTO }) {
  const [state, formAction] = useActionState(completeTodoAction, emptyActionState);

  return (
    <li className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-black/10 bg-white px-4 py-3 dark:border-white/10 dark:bg-white/5">
      <div className="min-w-0">
        <span className="truncate font-medium">{item.title}</span>
        <p className="muted mt-0.5">
          Added by {item.isOwn ? "you" : item.memberName}
        </p>
      </div>

      <form action={formAction} className="flex items-center gap-2">
        <input type="hidden" name="groupName" value={groupName} />
        <input type="hidden" name="todoId" value={item.id} />
        <CompleteButton />
        {state.error ? (
          <span className="text-xs text-red-600">{state.error}</span>
        ) : null}
      </form>
    </li>
  );
}

export function TodoList({
  groupName,
  items,
}: {
  groupName: string;
  items: TodoDTO[];
}) {
  const mounted = useMounted();

  if (!mounted) {
    return (
      <div className="space-y-2" aria-hidden>
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            className="h-14 animate-pulse rounded-lg bg-black/5 dark:bg-white/5"
          />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return <p className="muted">Nothing to do yet. Add the first item above.</p>;
  }

  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <TodoRow key={item.id} groupName={groupName} item={item} />
      ))}
    </ul>
  );
}
