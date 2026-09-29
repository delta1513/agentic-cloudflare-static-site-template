# Next.js static site on Cloudflare Workers

A hello-world Next.js app that is exported as a static site (`output: "export"`)
and served by a Cloudflare Worker using static assets.

## How it works

- `next.config.ts` sets `output: "export"`, so `next build` writes the site to `out/`.
- `wrangler.jsonc` points the Worker's `assets.directory` at `out/`. There is no Worker script; Cloudflare serves the files directly.
- The Cloudflare GitHub integration runs `npm run build` and deploys on every push, so no GitHub workflow is needed.

## Commands

```bash
npm install
npm run dev       # local dev server
npm run build     # static export to ./out
npm run preview   # build, then serve with wrangler (Workers runtime)
npm run deploy    # manual deploy with wrangler
```

## Using as a template

Change `name` in `wrangler.jsonc` (and `package.json`) to your project name.
