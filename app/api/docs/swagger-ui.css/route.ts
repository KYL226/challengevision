import { readFile } from "fs/promises"
import path from "path"

export const runtime = "nodejs"

export async function GET() {
  const filePath = path.join(process.cwd(), "node_modules", "swagger-ui-dist", "swagger-ui.css")
  const css = await readFile(filePath)
  return new Response(css, { headers: { "content-type": "text/css; charset=utf-8" } })
}

