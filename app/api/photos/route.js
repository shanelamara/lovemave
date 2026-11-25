import { createHash, createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { listManagerPhotos, listPhotos, PhotoStorageConflict, PhotoStorageUnavailable, readChanges, updateChanges } from "../../lib/photo-store";

const COOKIE = "love_mave_photo_session";
const SESSION_SECONDS = 60 * 60 * 4;
const MAX_IMAGE = 2 * 1024 * 1024;
const MAX_PHOTOS = 30;
const COLLECTIONS = ["little-friends", "hugot", "sassy"];
const failures = [];

function json(data, status = 200) {
  return NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });
}

function sameSecret(first, second) {
  const digest = value => createHash("sha256").update(value).digest();
  return timingSafeEqual(digest(first), digest(second));
}

function signature(value, code) {
  const key = process.env.PHOTO_SESSION_SECRET || code;
  return createHmac("sha256", key).update("photo-management:" + value + ":" + code).digest("hex");
}

function authorized(request) {
  const code = process.env.PHOTO_ACCESS_CODE;
  const token = request.cookies.get(COOKIE)?.value;
  if (!code || !token) return false;
  const [expires, nonce, signed] = token.split(".");
  return !!nonce && !!signed && Number(expires) > Date.now() &&
    sameSecret(signed, signature(expires + "." + nonce, code));
}

function sessionResponse(request, code) {
  const response = json({ ok: true });
  const value = code ? (Date.now() + SESSION_SECONDS * 1000) + "." + randomUUID() : "";
  response.cookies.set(COOKIE, code ? value + "." + signature(value, code) : "", {
    httpOnly: true,
    sameSite: "strict",
    secure: request.nextUrl.protocol === "https:",
    path: "/api/photos",
    maxAge: code ? SESSION_SECONDS : 0,
  });
  return response;
}

async function boundedForm(request) {
  const chunks = [];
  let length = 0;
  for await (const chunk of request.body ?? []) {
    length += chunk.byteLength;
    if (length > MAX_IMAGE + 16384) throw new Error("too large");
    chunks.push(chunk);
  }
  return new Response(Buffer.concat(chunks), {
    headers: { "Content-Type": request.headers.get("content-type") ?? "" },
  }).formData();
}

async function uploadedImage(file) {
  if (!(file instanceof File) || !file.size) return null;
  if (file.size > MAX_IMAGE) throw new Error("Choose a photo under 2 MB.");
  const bytes = Buffer.from(await file.arrayBuffer());
  const startsWith = hex => bytes.subarray(0, hex.length / 2).toString("hex") === hex;
  let type;
  if (startsWith("89504e470d0a1a0a")) type = "image/png";
  if (startsWith("ffd8ff")) type = "image/jpeg";
  if (bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP") type = "image/webp";
  if (!type) throw new Error("Choose a JPG, PNG, or WebP photo.");
  return { type, base64: bytes.toString("base64") };
}

export async function GET(request) {
  const imageId = request.nextUrl.searchParams.get("image");
  if (imageId !== null) {
    const changes = await readChanges();
    const image = Object.hasOwn(changes, imageId) && changes[imageId]?.image;
    if (!image) return new Response(null, { status: 404 });
    return new Response(Buffer.from(image.base64, "base64"), {
      headers: { "Content-Type": image.type, "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" },
    });
  }
  if (!authorized(request)) return json({ error: "Enter your access code to continue." }, 401);
  try {
    return json({ photos: listManagerPhotos(await readChanges()) });
  } catch (error) {
    console.error("Could not read photo storage.", error);
    return json({ error: "Could not load photos from storage." }, 503);
  }
}

export async function POST(request) {
  if (request.headers.get("x-photo-manager") !== "1") return json({ error: "Invalid request." }, 403);
  const action = request.nextUrl.searchParams.get("action");

  if (action === "login") {
    const code = process.env.PHOTO_ACCESS_CODE;
    if (!code) return json({ error: "Photo management access has not been configured." }, 503);
    const now = Date.now();
    while (failures.length && failures[0] <= now - 60000) failures.shift();
    if (failures.length >= 8) return json({ error: "Too many attempts. Try again in a minute." }, 429);
    let input;
    try {
      input = (await boundedForm(request)).get("code");
    } catch {
      return json({ error: "Invalid access code request." }, 400);
    }
    if (failures.length >= 8) return json({ error: "Too many attempts. Try again in a minute." }, 429);
    if (typeof input !== "string" || !sameSecret(input, code)) {
      failures.push(now);
      return json({ error: "That access code is incorrect." }, 403);
    }
    return sessionResponse(request, code);
  }

  if (action === "logout") return sessionResponse(request);
  if (!authorized(request)) return json({ error: "Enter your access code to continue." }, 401);
  if (action !== "save" && action !== "delete") return json({ error: "Invalid action." }, 400);

  let form;
  let image;
  try {
    form = await boundedForm(request);
  } catch {
    return json({ error: "Invalid upload. Photos must be under 2 MB." }, 400);
  }
  try {
    if (action === "save") image = await uploadedImage(form.get("image"));
  } catch (error) {
    return json({ error: error.message }, 400);
  }

  try {
    return await updateChanges(changes => changePhoto(changes, action, form, image));
  } catch (error) {
    if (error instanceof PhotoStorageUnavailable) {
      return json({ error: "Connect a private Vercel Blob store to enable photo changes." }, 503);
    }
    if (error instanceof PhotoStorageConflict) {
      return json({ error: "Could not confirm the latest photo catalog version. Refresh the photo manager and try again." }, 409);
    }
    console.error("Could not update photo storage.", error);
    return json({ error: "Could not save the photo change to storage." }, 503);
  }
}

function changePhoto(changes, action, form, image) {
  const photos = listPhotos(changes);
  const id = form.get("id");
  const current = photos.find(photo => photo.id === id);
  if (id && !current) return json({ error: "This photo is no longer on the styling table." }, 404);

  if (action === "delete") {
    if (!current) return json({ error: "Choose a photo to delete." }, 400);
    if (current.img === undefined) delete changes[id];
    else changes[id] = null;
  } else {
    const name = String(form.get("name") ?? "").trim();
    const desc = String(form.get("desc") ?? "").trim();
    const col = form.get("col");
    if (!name || name.length > 80 || desc.length > 300 || !COLLECTIONS.includes(col)) {
      return json({ error: "Enter a mug name, a valid collection, and a description under 300 characters." }, 400);
    }
    if (!current && !image) return json({ error: "Choose a photo to upload." }, 400);
    if (!current && photos.length >= MAX_PHOTOS) return json({ error: "The styling table can hold up to 30 photos." }, 409);
    const photoId = current?.id ?? randomUUID();
    const previous = changes[photoId]?.image;
    const { src, ...photo } = current ?? { id: photoId, h: 1, tagline: "" };
    changes[photoId] = { ...photo, name, desc, col, image: image ?? previous };
  }
  return json({ photos: listManagerPhotos(changes) });
}
