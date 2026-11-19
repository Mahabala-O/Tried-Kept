export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs" || !process.env.NEXT_MANUAL_SIG_HANDLE) return;
  const { handleShutdownSignals } = await import("./lib/shutdown");
  handleShutdownSignals();
}
