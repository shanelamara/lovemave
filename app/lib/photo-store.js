import { randomUUID } from "node:crypto";
import { mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import defaults from "./mug-photos.json";

const previewIds = [7344, 7347, 7348, 7355, 7357, 7359, 7368, 7370, 7372, 7374];

function directory() {
  return process.env.PHOTO_DATA_DIR || join(process.cwd(), ".photo-data");
}

export function readChanges() {
  try {
    return JSON.parse(readFileSync(join(directory(), "photos.json"), "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return {};
    throw error;
  }
}

export function writeChanges(changes) {
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

export function listPhotos(changes = readChanges()) {
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
