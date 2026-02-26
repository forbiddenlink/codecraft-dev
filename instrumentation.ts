export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

export const onRequestError = async (
  error: Error,
  request: { path: string; method: string; headers: Record<string, string> },
  context: { routerKind: string; routePath: string; routeType: string; revalidateReason?: string }
) => {
  // Only report if Sentry is configured
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) return;

  const { captureRequestError } = await import("@sentry/nextjs");
  captureRequestError(error, request, context);
};
