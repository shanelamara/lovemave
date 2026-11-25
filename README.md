# Love, Mave

## Photo management

1. Set `PHOTO_ACCESS_CODE` in `.env.local` for local use, or in the server environment for hosting. Choose a long, unique code and share it only with people who should manage photos.
2. Start the Next.js app and open `/admin` or `/photo-management`. Enter the access code to unlock the manager.
3. Add a photo, edit its details, replace its image, or delete it. Reload the styling table to see saved changes. The manager accepts JPG, PNG, and WebP images up to 2 MB each.

### Vercel

In the Vercel project, open **Storage**, create a **Private Blob** store, and connect it to the project's **Production** environment. Keep `PHOTO_ACCESS_CODE` set in Production and redeploy. The app uses the Blob credentials added by the connection. If you enable photo management in Preview, connect a separate private store there so tests don't change the live catalog.

You can also set `PHOTO_SESSION_SECRET` to a long random value in the same environment to sign photo manager sessions with a separate secret.

### Local and self-hosted

Without Blob credentials, the app stores photo changes in `.photo-data` outside Vercel. Set `PHOTO_DATA_DIR` to a writable, persistent directory on the host and back it up with your site data. Run a single Next.js server instance against that directory. To move existing local changes to Vercel, upload `.photo-data/photos.json` to the private store as `photo-management/photos.json` before making changes on the live site.
