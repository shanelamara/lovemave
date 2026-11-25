import { randomUUID } from "node:crypto";
import { mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { BlobNotFoundError, BlobPreconditionFailedError, get, head, put } from "@vercel/blob";
import defaults from "./mug-photos.json";

const blobPath = "photo-management/photos.json";
const previewIds = [7344, 7347, 7348, 7355, 7357, 7359, 7368, 7370, 7372, 7374];
const blobOptions = { access: "private" };

export class PhotoStorageUnavailable extends Error {}
export class PhotoStorageConflict extends Error {}

function usesBlob() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);
}

async function readBlob() {
  const result = await get(blobPath, { ...blobOptions, useCache: false });
  return result ? new Response(result.stream).json() : null;
}

async function blobMetadata() {
  try {
    return await head(blobPath);
  } catch (error) {
    if (error instanceof BlobNotFoundError) return null;
    throw error;
  }
}

function directory() {
  return process.env.PHOTO_DATA_DIR || join(process.cwd(), ".photo-data");
}

function readLocalChanges() {
  try {
    return JSON.parse(readFileSync(join(directory(), "photos.json"), "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return {};
    throw error;
  }
}

function writeLocalChanges(changes) {
  const dir = directory();
  mkdirSync(dir, { recursive: true });
  const temporary = join(dir, randomUUID() + ".tmp");
  try {
    writeFileSync(temporary, JSON.stringify(changes), { flag: "wx" });
    renameSync(temporary, join(dir, "photos.json"));
  } finally {
    rmSync(temporary, { force: true });
  }
}

export async function readChanges() {
  if (usesBlob()) return (await readBlob()) ?? {};
  return process.env.VERCEL ? {} : readLocalChanges();
}

export async function updateChanges(update) {
  if (!usesBlob()) {
    if (process.env.VERCEL) throw new PhotoStorageUnavailable();
    const changes = readLocalChanges();
    const result = update(changes);
    if (result.ok) writeLocalChanges(changes);
    return result;
  }

  for (let attempt = 0; attempt < 3; attempt++) {
    // Read metadata first so a write racing the download fails the condition.
    const metadata = await blobMetadata();
    const changes = metadata ? await readBlob() : {};
    if (!changes) continue;
    if (metadata && !metadata.etag) throw new Error("Photo catalog metadata is missing its ETag.");
    const result = update(changes);
    if (!result.ok) return result;

    const body = JSON.stringify(changes);
    try {
      await put(blobPath, body, {
        ...blobOptions,
        contentType: "application/json",
        multipart: Buffer.byteLength(body) > 5 * 1024 * 1024,
        ...(metadata ? { allowOverwrite: true, ifMatch: metadata.etag } : { allowOverwrite: false }),
      });
      return result;
    } catch (error) {
      if (error instanceof BlobPreconditionFailedError || (!metadata && await blobMetadata())) continue;
      throw error;
    }
  }
  throw new PhotoStorageConflict();
}

export function listPhotos(changes) {
  const originalIds = new Set(defaults.map(photo => photo.id));
  const originals = defaults.map(photo => Object.hasOwn(changes, photo.id) ? changes[photo.id] : photo);
  const additions = Object.values(changes).filter(photo => photo && !originalIds.has(photo.id));
  return [...originals.filter(Boolean), ...additions].map(({ image, ...photo }) => ({
    ...photo,
    ...(image ? { src: "/api/photos?image=" + photo.id } : {}),
  }));
}

export function listManagerPhotos(changes) {
  return listPhotos(changes).map(photo => ({
    ...photo,
    src: photo.src ?? "/assets/images/collection/" + previewIds[photo.img] + ".webp",
  }));
}
