# Love, Mave

## Photo management

1. Set `PHOTO_ACCESS_CODE` in `.env.local` for local use, or in the server environment for hosting. Choose a long, unique code and share it only with people who should manage photos.
2. Start the Next.js app and open `/photo-management`. Enter the access code to unlock the manager.
3. Add a photo, edit its details, replace its image, or delete it. Reload the styling table to see saved changes. The manager accepts JPG, PNG, and WebP images up to 2 MB each.

The app stores photo changes in `.photo-data` by default. Set `PHOTO_DATA_DIR` to a writable, persistent directory on the host and back it up with your site data. Run a single Next.js server instance against that directory. Hosts with ephemeral or read-only filesystems need a persistent volume or a different storage implementation.
