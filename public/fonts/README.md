# Brand font — HenkelGTFlexa

The headline typeface is bundled locally because the Henkel font host
(`aihub.az.henkelgroup.io`) sends no `Access-Control-Allow-Origin` header, so a
cross-origin `@font-face` is blocked by the browser even when the CSP allows it
(see DESIGN.md § "Content Security Policy").

**Drop the font file here:**

```
public/fonts/HenkelGTFlexa-Md.otf
```

Download it from (corporate network required):

```
https://aihub.az.henkelgroup.io/assets/fonts/HenkelGTFlexa-Md_4244971728.otf
```

Until the `.otf` is present, headlines fall back to **Segoe UI** (uppercase +
weight still carry the brand). `@font-face` is already wired in
`src/assets/css/main.css` with `font-display: swap`, so adding the file is the
only step needed — no code change.
