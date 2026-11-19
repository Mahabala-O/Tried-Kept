import { closeDb } from "./db";

/**
 * Exits cleanly when the host stops the server. Railway stops the old container
 * with SIGTERM on every deploy. Next's own handler exits with code 143, which
 * Railway reports as a crash, so the start script sets NEXT_MANUAL_SIG_HANDLE
 * and this closes the database and exits with 0 instead.
 */
export function handleShutdownSignals(): void {
  let stopping = false;
  const stop = (signal: NodeJS.Signals) => {
    if (stopping) return;
    stopping = true;
    console.log(`${signal} received, closing the database and shutting down.`);
    try {
      closeDb();
    } catch (error) {
      console.error("Could not close the database cleanly.", error);
    }
    process.exit(0);
  };
  process.on("SIGTERM", stop);
  process.on("SIGINT", stop);
}
