# rbncreates.com

Static site for Ruben Camacho, served by Cloudflare Workers (static assets).

- `public/` is the whole site (HTML, CSS, JS, images, audio, reels)
- `wrangler.jsonc` is the Cloudflare config (worker name `rbncreates`)

## Deploy

```bash
npx wrangler login      # once, opens the browser
npx wrangler deploy     # uploads ./public, prints https://rbncreates.<account>.workers.dev
```

Then in the Cloudflare dashboard: Workers & Pages > rbncreates > Settings > Domains & Routes > Add > Custom domain > `rbncreates.com` (and `www.rbncreates.com`).
The domain's DNS must be on the same Cloudflare account. Adding the custom domain replaces whatever the domain serves today.

## Local preview

```bash
npx wrangler dev
```

## Editing

Add or change projects in `public/catalogue.js`, reels in `public/content.html`, brand logos in `public/content.html` and `public/index.html`.
