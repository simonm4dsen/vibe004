"use client";

import { useActionState, useState } from "react";

import { createGroupAction, joinGroupAction } from "@/app/actions/groups";
import { SubmitButton } from "@/components/submit-button";
import { emptyActionState } from "@/lib/action-state";

type Tab = "join" | "create";

export function GroupForms({ defaultDisplayName }: { defaultDisplayName: string }) {
  const [tab, setTab] = useState<Tab>("join");
  const [createState, createFormAction] = useActionState(
    createGroupAction,
    emptyActionState,
  );
  const [joinState, joinFormAction] = useActionState(
    joinGroupAction,
    emptyActionState,
  );

  // Controlled so a rejected submit (wrong password, taken name…) keeps what
  // the user typed — React resets uncontrolled forms after an action runs.
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState(defaultDisplayName);

  const isJoin = tab === "join";
  const state = isJoin ? joinState : createState;

  return (
    <div className="card">
      <div className="mb-5 inline-flex rounded-lg border border-black/10 p-1 dark:border-white/10">
        <button
          type="button"
          onClick={() => setTab("join")}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
            isJoin ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900" : "hover:bg-black/5 dark:hover:bg-white/10"
          }`}
        >
          Join a group
        </button>
        <button
          type="button"
          onClick={() => setTab("create")}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
            !isJoin ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900" : "hover:bg-black/5 dark:hover:bg-white/10"
          }`}
        >
          Create a group
        </button>
      </div>

      <form
        key={tab}
        action={isJoin ? joinFormAction : createFormAction}
        className="space-y-4"
      >
        {state.error ? <p className="form-error">{state.error}</p> : null}

        <div>
          <label className="label" htmlFor="name">
            Group name
          </label>
          <input
            id="name"
            name="name"
            required
            className="input"
            placeholder="friday-crew"
            pattern="[A-Za-z0-9\-]{3,32}"
            title="3-32 characters: letters, numbers and dashes"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <p className="muted mt-1 text-xs">
            {isJoin
              ? "The unique name the group was created with."
              : "Lowercase letters, numbers and dashes. This is what others use to join."}
          </p>
        </div>

        <div>
          <label className="label" htmlFor="password">
            Group password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={isJoin ? undefined : 8}
            className="input"
            placeholder={isJoin ? "Shared password" : "At least 8 characters"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>

        <div>
          <label className="label" htmlFor="displayName">
            Your display name in this group
          </label>
          <input
            id="displayName"
            name="displayName"
            required
            maxLength={32}
            className="input"
            placeholder="Alex"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
          />
        </div>

        <SubmitButton
          pendingLabel={isJoin ? "Joining…" : "Creating…"}
          className="btn-primary w-full"
        >
          {isJoin ? "Join group" : "Create group"}
        </SubmitButton>
      </form>
    </div>
  );
}
