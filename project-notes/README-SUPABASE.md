# TeaRoad — Supabase auth and account data

This branch adds real Supabase Auth and persistence for the main mutable account features.

## Local setup

1. Keep your local `.env` (do not commit it):
   ```dotenv
   VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
   ```
2. Install dependencies and build:
   ```powershell
   npm install
   npm run build
   ```
3. Serve the built site locally:
   ```powershell
   npx serve -s dist -l 5173
   ```
4. Add the local URL in Supabase Dashboard → Authentication → URL Configuration:
   - Site URL: `http://localhost:5173`
   - Redirect URLs: `http://localhost:5173/**`
   Add the production site URL there too if you use password recovery in production.
5. Open `http://localhost:5173`.

## What is connected

- Auth: real registration, password login, sign-out, password recovery/reset.
- Profiles: no row is created during sign-up; the user explicitly saves one from `/profile`.
- Cart: guests use localStorage; signed-in users save `carts` and `cart_items`.
- Favorites: guests use localStorage; signed-in users save `favorites`.
- Orders: authenticated checkout invokes the existing `place_order` RPC and reads the current user's orders.
- Catalog: reads products, categories, product images and taste tags from Supabase.

## Check the database

In Supabase Table Editor:
- `auth.users` — registered accounts.
- `public.profiles` — only accounts that explicitly saved the profile form.
- `public.carts` and `public.cart_items` — authenticated user's saved cart.
- `public.favorites` — authenticated user's saved favorites.
- `public.orders`, `public.order_addresses`, `public.order_items` — orders created through checkout.

Client writes are restricted by RLS. Never put the `sb_secret_...` key in browser code.

The promotion UI and gift-set UI still use existing demo data in this pass; the mutable account features above are now wired to the database.
