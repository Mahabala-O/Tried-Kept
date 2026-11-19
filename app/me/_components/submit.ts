"use client";

import { startTransition, type FormEvent } from "react";

/**
 * React resets a form after its action runs, which would wipe what someone typed
 * when the server rejects it. Dispatching by hand keeps their input in place.
 */
export function submitKeepingValues(dispatch: (data: FormData) => void) {
  return (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    startTransition(() => dispatch(data));
  };
}
