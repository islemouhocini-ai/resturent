# Rivolta Restaurant

This project uses Next.js and includes:

- a polished restaurant website
- a floating guest concierge chat
- a support inbox with ticket replies and close actions
- an `/admin` dashboard
- editable `menu` and `chefs` content from the admin panel
- shared staff login for `support` and `admin`
- a Supabase-ready data layer with local fallback for development
- image uploads that switch to Supabase Storage in production

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Useful local routes:

- `/support`
- `/admin`

Local demo credentials when Supabase is not configured:

- Support: `support@rivolta.local` / `Support123!`
- Admin: `admin@rivolta.local` / `Admin123!`

## Production build

```bash
npm run build
```

## Supabase setup

1. Create a Supabase project.
2. Run [supabase/schema.sql](/C:/Users/Islem/Documents/Playground/supabase/schema.sql) in the SQL editor.
3. Copy [.env.example](/C:/Users/Islem/Documents/Playground/.env.example) to `.env.local`.
4. Fill in `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_STORAGE_BUCKET`, and `STAFF_SESSION_SECRET`.
   Important: `SUPABASE_SERVICE_ROLE_KEY` must be the Supabase `secret` / `service_role` key, not the `publishable` / `anon` key.
5. Generate password hashes:

```bash
npm run hash-password -- YourStrongPassword
```

6. Generate ready-to-run SQL for your `support` and `admin` users:

```bash
npm run make-staff-sql -- admin@your-restaurant.com Admin123! support@your-restaurant.com Support123!
```

7. Copy the SQL output and run it in the Supabase SQL editor.

What moves to Supabase automatically after setup:

- admin edits for `menu`, `chefs`, and `gallery`
- support tickets and replies
- uploaded images from the admin dashboard

If `SUPABASE_STORAGE_BUCKET` is left empty, the app uses the default bucket name `site-media`.

If Supabase is not configured yet, the app automatically falls back to local storage so you can keep building.

## Admin content editing

After signing in to `/admin`, you can now:

- open `Dashboard`
- switch to `Menu Settings`
- add, edit, and delete menu items
- switch to `Chefs Settings`
- add, edit, and delete chef profiles

In local mode, editable content is stored in [site-content.json](/C:/Users/Islem/Documents/Playground/data/site-content.json).

## GitHub and Vercel flow

1. Create a new GitHub repository.
2. Add your GitHub repository as a remote.
3. Push the `main` branch.
4. Import the repository into Vercel.
5. After connecting the repository, every new push triggers a new deployment automatically.
