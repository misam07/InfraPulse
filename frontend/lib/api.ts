/**
 * Tiny API client for the InfraPulse backend.
 *
 * The base URL comes from NEXT_PUBLIC_API_URL (see .env.example) so the
 * same build can point at a local or remote backend. All failures are
 * normalized into ApiError with a human-readable message.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export class ApiError extends Error {
  /** HTTP status, or 0 when the backend could not be reached at all. */
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function apiGet<T>(path: string): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
  } catch {
    throw new ApiError(
      0,
      "Cannot reach the InfraPulse API. Make sure the backend is running."
    );
  }

  if (!response.ok) {
    let detail = response.statusText;
    try {
      const body = (await response.json()) as { detail?: string };
      if (body?.detail) detail = body.detail;
    } catch {
      // Non-JSON error body — keep the status text.
    }
    throw new ApiError(response.status, detail);
  }

  return (await response.json()) as T;
}
