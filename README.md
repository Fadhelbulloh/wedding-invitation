# Wedding Invitation

Self-hosted wedding invitation. Next.js, file-based JSON storage, per-guest token links.

## Dev

    cp data/guests.example.json data/guests.json
    echo "ADMIN_PASSWORD=test123" > .env.local
    npm install
    npm run dev

Open http://localhost:3000/i/abc123

## Deploy (VPS)

1. `npm ci && npm run build`
2. Set env: `ADMIN_PASSWORD`, `DATA_DIR=/var/lib/wedding-invitation` (dir must exist, writable by the app user, contains `guests.json`)
3. Run `npm start` under a process manager (systemd/pm2) behind your reverse proxy (nginx/caddy) with HTTPS on your domain
4. Guest links: `https://your-domain/i/<token>`
5. Admin: `https://your-domain/admin`

## Guests

`$DATA_DIR/guests.json`: `{ "token": "Display Name" }`. Generate tokens: `openssl rand -hex 8`.

## Admin

The admin moderates guest messages (approve/delete) and views RSVPs at `/admin` — log in with `ADMIN_PASSWORD`.

## Backup

Copy `$DATA_DIR` (rsvps.json, messages.json, guests.json) off the VPS regularly:

    rsync -a vps:/var/lib/wedding-invitation/ ./backup/

## Tests

    node --test src/lib/guests.test.ts src/lib/storage.test.ts
