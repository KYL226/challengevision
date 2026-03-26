import { readFile } from "fs/promises"
import path from "path"

export const runtime = "nodejs"

export async function GET() {
  const filePath = path.join(process.cwd(), "node_modules", "swagger-ui-dist", "swagger-ui-bundle.js")
  const js = await readFile(filePath)
  return new Response(js, { headers: { "content-type": "application/javascript; charset=utf-8" } })
}

