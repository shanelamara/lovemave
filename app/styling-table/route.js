import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { listPhotos, readChanges } from "../lib/photo-store";

export const dynamic = "force-dynamic";

export async function GET() {
  const html = await readFile(join(process.cwd(), "love-mave.html"));
  const photos = JSON.stringify(listPhotos(await readChanges())).replaceAll("<", "\\u003c");
  return new Response(html.toString("utf8").replace("/* mug-photo-data */ []", () => photos), {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
