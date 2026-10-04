# Wedding Invitation

A cozy, fully customisable wedding invitation website built with React + Vite.

- **`/`** – the invitation guests see (full-screen embossed envelope with wax seal, arch photo frames, floral decorations, hero, countdown, story, scratch-to-reveal events, rituals, gallery, venue map, WhatsApp RSVP, contact, music).
- **`/admin`** – the editor: change photos, text, theme colours, fonts, sections and music, with a live mobile / desktop preview.

## Run locally

```bash
npm install
npm run dev          # http://localhost:5173  and  http://localhost:5173/admin
```

Without a backend the editor runs in **local mode**: edits are saved in your browser only.

## Deploy on Vercel (so edits go live for every guest)

1. Push this folder to GitHub and import it in Vercel (framework preset: **Vite**).
2. **Storage → Create → Blob** and connect it to the project. This adds `BLOB_READ_WRITE_TOKEN` automatically.
3. **Settings → Environment Variables** → add `ADMIN_PASSWORD` with a strong password.
4. Redeploy. Open `https://your-site.vercel.app/admin`, log in, edit, and press **Publish**.

Photos are resized in the browser (max ~1800px) and uploaded to Vercel Blob. Every publish is stored as a new version (the last 15 are kept).

To test the API locally, run `npx vercel dev` with the same variables in a local `.env` (never commit it).

### Publishing without Blob storage

In local mode, open **Backup → Download backup**, save the file as `public/config.json`, and redeploy. Uploaded photos are embedded in that file, so keep it small or use image URLs.

## Project structure

```
api/                 Vercel serverless functions (status, login, config, upload)
src/config/          default content + theme presets
src/invitation/      the guest-facing invitation (sections, styles)
src/admin/           the /admin editor
src/lib/             storage, dates/calendar, image compression
```

## Notes

- The RSVP form opens WhatsApp with a pre-filled message. No guest data is stored by the site.
- Telugu / Hindi / Tamil / Kannada text renders with matching Noto fonts automatically.
- Login attempts are slowed down but not rate-limited across instances. Use a long, unique `ADMIN_PASSWORD`.
