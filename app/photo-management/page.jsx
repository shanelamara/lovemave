"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./photo-management.module.css";

const endpoint = "/api/photos";
const collections = {
  "little-friends": "Little Friends",
  hugot: "Hugot Hours",
  sassy: "Sassy Sips",
};

async function readResponse(response, fallback) {
  const data = await response.json().catch(() => null);
  if (!response.ok || !data) throw new Error(data?.error || fallback);
  return data;
}

export default function PhotoManagement() {
  const [photos, setPhotos] = useState(null);
  const [active, setActive] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  const dialogRef = useRef(null);
  const addButtonRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const response = await fetch(endpoint, { cache: "no-store" });
        if (response.status === 401) return;
        const data = await readResponse(response, "Could not load photos.");
        if (!cancelled) setPhotos(data.photos);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (active && !dialog.open) {
      dialog.showModal();
      dialog.querySelector("[data-initial-focus]")?.focus();
    } else if (!active && dialog.open) {
      dialog.close();
    }
  }, [active]);

  useEffect(() => {
    if (feedback === "Photo deleted.") addButtonRef.current?.focus();
  }, [feedback]);

  function openDialog(action, photo) {
    setActive({ action, photo });
    setError("");
    setFeedback("");
  }

  function closeDialog() {
    setActive(null);
    setError("");
  }

  async function submit(action, form, message = "") {
    setBusy(true);
    setError("");
    setFeedback("");
    try {
      const response = await fetch(endpoint + "?action=" + action, {
        method: "POST",
        headers: { "X-Photo-Manager": "1" },
        body: form,
      });
      if (response.status === 401) {
        setPhotos(null);
        setActive(null);
      }
      const fallback = action === "save" ? "Could not save the photo." : "Could not complete the request.";
      const data = await readResponse(response, fallback);
      if (action === "login") {
        const catalog = await fetch(endpoint, { cache: "no-store" });
        const catalogData = await readResponse(catalog, "Could not open the photo manager.");
        setPhotos(catalogData.photos);
      } else {
        setPhotos(data.photos ?? null);
      }
      setActive(null);
      setRevision(value => value + 1);
      setFeedback(message);
    } catch (err) {
      setError(err.message || "Could not complete the request.");
    } finally {
      setBusy(false);
    }
  }

  const selected = active?.photo;
  const deleting = active?.action === "delete";

  return (
    <main className={styles.manager}>
      <div className={styles.topbar}>
        <a className="brand" href="/">love, mave<span aria-hidden="true">♡</span></a>
        {photos && <button className={styles.quiet} type="button" disabled={busy} onClick={() => submit("logout")}>Sign out</button>}
      </div>
      <div className={styles.heading}>
        <div>
          <h1>Photo management</h1>
          {photos && <p>Styling table · {photos.length} {photos.length === 1 ? "photo" : "photos"}</p>}
        </div>
        {photos && <button ref={addButtonRef} className={styles.primary} type="button" disabled={busy} onClick={() => openDialog("save", {})}>Add photo</button>}
      </div>
      {loading && <p role="status">Loading photo manager…</p>}
      {error && !active && <p className={styles.error} role="alert">{error}</p>}
      {feedback && <p role="status">{feedback}</p>}

      {!loading && !photos && (
        <form className={`${styles.form} ${styles.login}`} onSubmit={event => {
          event.preventDefault();
          submit("login", new FormData(event.currentTarget));
        }}>
          <label>Access code<input name="code" type="password" autoComplete="current-password" required maxLength={256} /></label>
          <button className={styles.primary} disabled={busy}>{busy ? "Checking…" : "Unlock photo manager"}</button>
        </form>
      )}

      {photos && (
        <>
          <dialog
            ref={dialogRef}
            className={styles.dialog}
            aria-labelledby="photo-dialog-title"
            aria-describedby={deleting ? "photo-delete-description" : undefined}
            onCancel={event => {
              event.preventDefault();
              if (!busy) closeDialog();
            }}
          >
            {active && (
              <form className={styles.form} onSubmit={event => {
                event.preventDefault();
                const message = deleting ? "Photo deleted." : selected.id ? "Photo updated." : "Photo added.";
                submit(active.action, new FormData(event.currentTarget), message);
              }}>
                <h2 id="photo-dialog-title">{deleting ? "Delete photo?" : selected.id ? "Edit photo" : "Add photo"}</h2>
                {selected.id && <input type="hidden" name="id" value={selected.id} />}
                {deleting ? (
                  <p id="photo-delete-description">“{selected.name}” will be removed from the styling table.</p>
                ) : (
                  <>
                    <label>Mug name<input data-initial-focus name="name" required maxLength={80} defaultValue={selected.name} /></label>
                    <label>Collection
                      <select name="col" defaultValue={selected.col ?? "little-friends"}>
                        {Object.entries(collections).map(([id, label]) => <option key={id} value={id}>{label}</option>)}
                      </select>
                    </label>
                    <label>Description<textarea name="desc" rows={3} maxLength={300} defaultValue={selected.desc} /></label>
                    <label>{selected.id ? "Replacement photo (optional)" : "Photo"}
                      <input type="file" name="image" accept="image/jpeg,image/png,image/webp" required={!selected.id} />
                      <small>JPG, PNG, or WebP, up to 2 MB.</small>
                    </label>
                  </>
                )}
                {error && <p className={styles.error} role="alert">{error}</p>}
                <div className={styles.dialogActions}>
                  <button data-initial-focus={deleting ? "" : undefined} type="button" disabled={busy} onClick={closeDialog}>Cancel</button>
                  <button className={deleting ? styles.danger : styles.primary} disabled={busy}>
                    {deleting ? (busy ? "Deleting…" : "Delete photo") : (busy ? "Saving…" : "Save photo")}
                  </button>
                </div>
              </form>
            )}
          </dialog>
          {!photos.length && <p>No photos on the styling table yet.</p>}
          <ul className={styles.grid}>
            {photos.map(photo => (
              <li key={photo.id} className={styles.card}>
                <img src={photo.src + (photo.src.includes("?") ? "&v=" + revision : "")} alt={photo.name} loading="lazy" />
                <div className={styles.cardDetails}>
                  <h2>{photo.name}</h2>
                  <p>{collections[photo.col]}</p>
                </div>
                <div className={styles.actions}>
                  <button className={styles.quiet} type="button" disabled={busy} onClick={() => openDialog("save", photo)} aria-label={`Edit ${photo.name}`}>Edit</button>
                  <button className={styles.quiet} type="button" disabled={busy} onClick={() => openDialog("delete", photo)} aria-label={`Delete ${photo.name}`}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}
