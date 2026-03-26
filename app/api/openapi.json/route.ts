import { buildOpenApiSpec } from "@/app/lib/openapi"
import { json } from "@/app/lib/http"

export const runtime = "nodejs"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const origin = url.origin
  return json(buildOpenApiSpec(origin))
}

