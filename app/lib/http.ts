export function json(data: unknown, init: ResponseInit & { status?: number } = {}) {
  return Response.json(data, {
    ...init,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...(init.headers ?? {}),
    },
  })
}

export function errorJson(
  status: number,
  message: string,
  details?: unknown,
  extra?: Record<string, unknown>,
) {
  return json(
    {
      error: {
        message,
        ...(details === undefined ? {} : { details }),
        ...(extra ?? {}),
      },
    },
    { status },
  )
}

export function parsePagination(url: URL) {
  const page = Math.max(1, Number(url.searchParams.get("page") ?? "1") || 1)
  const limitRaw = Number(url.searchParams.get("limit") ?? "10") || 10
  const limit = Math.min(100, Math.max(1, limitRaw))
  const skip = (page - 1) * limit
  return { page, limit, skip }
}

export function parseDate(value: string) {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) throw new Error("Invalid date")
  return d
}

