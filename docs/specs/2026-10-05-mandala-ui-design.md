# mandala-ui: one design system for Atlas and Loopline

Atlas (Confluence replacement) was redesigned on 2026-10-05 (`atlas/docs/specs/2026-10-05-web-redesign-design.md`):
BNI teal/orange tokens, dark mode, Inter, lucide, a logo, and a set of React primitives. Loopline (Jira replacement)
is to receive the same theme. Rather than copy the files into a second repo, this package becomes the single
source both SPAs consume. Every rule about colour, type and interaction lives here once.

## Decisions (user, 2026-10-05)

1. A new repository `harismawan/mandala-ui`, package `@harismawan/mandala-ui`, consumed as a git dependency
   pinned to a tag. No npm registry.
2. The package ships TypeScript source and CSS modules; consumers bundle with `Bun.build`. No build step, no
   `dist/`.
3. Primitives stay data-free: no router, no query client, no knowledge of either product's API types.
4. Both product marks live here so the family stays consistent; the wordmark is Inter.
5. Loopline keeps its Jira-like layout; the package changes its skin, not its structure.

## Non-goals

- No Tailwind, Radix, CSS-in-JS or CDN assets (BNI deployments may be offline).
- No product-specific components (page tree, issue type icon, JQL field). Those stay in the products.
- No storybook; the products' screenshot scripts are the visual evidence.

## 1. Package layout

```
package.json         name, version, "type": "module", exports, peerDependencies, files: ["src"]
tsconfig.json        strict, jsx react-jsx, noUncheckedIndexedAccess, lib DOM
biome.json           same rules as the products (double quotes, 120 columns, cssModules)
bunfig.toml          [test] preload = ["./test/dom.ts"]
src/
  index.ts           re-exports ui/*, brand/*, lib/*
  styles/
    tokens.css       primitive scales + semantic roles + dark remap (from Atlas, no legacy aliases)
    global.css       reset, type, links, inputs, buttons[data-variant], tables, dialog, .sr-only
    fonts.css        @font-face Inter Variable (url("../assets/fonts/..."))
    tooltip.css      [data-tooltip]
    index.css        @import of the four above, in that order
  assets/fonts/      InterVariable.woff2, InterVariable-Italic.woff2, LICENSE-Inter.txt
  ui/                Button, IconButton, Icon, Menu, Popover, Dialog, Tabs, Avatar, Lozenge, Skeleton,
                     Spinner, EmptyState, Toast, Field; one .tsx + one .module.css each; ui/index.ts
  brand/             Logo.tsx, marks.tsx (AtlasMark, LooplineMark), favicon-atlas.svg, favicon-loopline.svg
  lib/               format.ts, theme.ts, prefs.ts, shortcuts.ts, confirm.tsx
test/
  dom.ts             jsdom globals + <dialog>/popover polyfills (preloaded)
  ui.test.tsx format.test.ts theme.test.ts shortcuts.test.ts
docs/specs/          this file
```

`exports`:

```json
{
  ".": "./src/index.ts",
  "./styles.css": "./src/styles/index.css",
  "./tokens.css": "./src/styles/tokens.css",
  "./global.css": "./src/styles/global.css",
  "./fonts.css": "./src/styles/fonts.css",
  "./favicon-atlas.svg": "./src/brand/favicon-atlas.svg",
  "./favicon-loopline.svg": "./src/brand/favicon-loopline.svg"
}
```

`peerDependencies`: `react ^19`, `react-dom ^19`, `lucide-react ^1`. `devDependencies`: typescript, @types/react(-dom),
@types/bun, jsdom, @testing-library/react, @biomejs/biome, lucide-react, react, react-dom.

## 2. Tokens

Identical to Atlas `styles/tokens.css` after the final sweep (teal 50..900, orange 50..900, teal-tinted greys,
semantic roles, dark remap on `[data-theme="dark"]` and `prefers-color-scheme`), plus:

- `--chart-1..6`: teal 600, orange 600, amber 600, green 600, `#6f5bd1` (purple), grey 500; dark variants one
  step lighter. Used by Loopline gadgets and charts, available to Atlas later.
- `--lozenge-new/indeterminate/done` keep their Jira status-category meaning.

No legacy aliases. A consumer that still reads the pre-redesign names keeps its own `legacy-tokens.css` until
its sweep.

## 3. Primitives

Moved from Atlas with these changes so nothing depends on product types:

| Component | Change |
| --- | --- |
| `Avatar` | props `name`, `id`, `src`, `size`, `square`. Hue from `hueOf(id)` over 6 hues. `PersonAvatar` stays in Atlas. |
| `EmptyState`, `ErrorState` | `ErrorState({ error, notFound?, action? })`; the consumer decides `notFound` from its own error type. |
| `Menu` | two forms. Composition: `children` of `MenuItem`/`MenuSeparator`/`MenuGroup`. Data: `items: MenuItemData[]` and `sections: { heading?, items }[]` where `MenuItemData = { label, onSelect?, href?, disabled?, danger?, bold?, checked?, icon?: LucideIcon \| ReactNode, description? } \| "separator"`. `header?: ReactNode` renders above the items. `trigger` is a render-prop; `triggerButton(node, { chevron, variant, className })` helper builds the common button trigger. |
| `Dialog` | adds `className`; keeps `size`, `tone`, `onSubmit`, `footer`, `description`. |
| `Lozenge` | `tone` plus `category?: "new" \| "indeterminate" \| "done"` mapped to the status tokens. |
| `Tabs` | unchanged; adds `variant: "underline" \| "pill"` (pill for Board / Backlog switches). |
| `Toast` | unchanged (`toast.success/error/info`, `ToastHost`). |
| `Field` | `TextField`, `Textarea`, `Select`, `Checkbox` unchanged. |
| `Skeleton`, `Spinner`, `Popover`, `Tabs`, `Button`, `IconButton`, `Icon` | unchanged. |

`lib/confirm.tsx`: `useConfirmDialog(verb)` returns `[node, confirm(message, action)]` on top of `Dialog`
(Loopline's `useConfirm` shape, so its callers only change the import).

`global.css` keeps the `button[data-variant="primary"|"subtle"|"danger"]` rules so Loopline's many plain
buttons restyle without a mass edit; `Button` is for new and polished screens.

## 4. Brand

`<Logo product="atlas" | "loopline" variant="mark" | "full" size inverse />`. Both marks: 32x32 orange tile
(`--brand`, radius 7), one white shape (stroke 3.75, round caps/joins), one teal accent (`--teal-800`, stroke 3.5).
Wordmark Inter 650, tracking -0.03em, in `--text` or white when `inverse`.

- Atlas: a white peak ("A") with a teal horizon through it as the crossbar (shipped).
- Loopline: a white path rising from bottom-left, looping once in the middle, leaving to the right; a teal dot
  at the start of the path. Target: the loop reads as an eye at 16px. If it does not, `size < 20` switches to a
  simplified path with a larger loop. The mark is reviewed as rendered PNGs (16/24/32/64, light and dark) before
  the tag.

Favicons repeat each mark with hard-coded colours and an in-SVG `prefers-color-scheme` block.

## 5. Consumption

```jsonc
// apps/web/package.json in Atlas and Loopline
"dependencies": { "@harismawan/mandala-ui": "github:harismawan/mandala-ui#v0.1.0", "lucide-react": "^1" }
```

```ts
import "@harismawan/mandala-ui/styles.css";
import { Button, Menu, Logo, initTheme, ToastHost } from "@harismawan/mandala-ui";
```

Each product wraps the logo once (`components/Logo.tsx` -> `<Logo product="loopline" />`) and links its favicon
from `index.html` through the package export path so `Bun.build` hashes it.

Verification before v0.1.0: a throwaway consumer build proves `Bun.build` processes `.module.css` and font `url()`
from `node_modules/@harismawan/mandala-ui`. If it does not, the fallback is plain CSS with `mu-` prefixed classes;
the component API does not change.

Versioning: semver tags `v0.x.y`; consumers pin a tag and bump deliberately. Docker builds already run
`bun install --frozen-lockfile` and need GitHub access, the same as npm today.

## 6. Atlas follow-up

PR `refactor(web): consume mandala-ui`: delete `components/ui/`, `components/Logo*`, `styles/{tokens,global,
fonts,tooltip}.css`, `assets/fonts`, `lib/{format,theme,prefs,shortcuts}.ts`; keep `PersonAvatar` and an
`ErrorState` wrapper that maps `ApiError` 404 to `notFound`. Tests for the moved modules move with them. No visual
change; the screenshot set is re-captured as proof.

## 7. Testing

`bun test` with the jsdom preload (the Bun CommonJS-linking order makes a per-file setup unreliable; this was
learned in Atlas). Suites: ui (Button, Menu keyboard and data form, Dialog, Tabs, Toast, Avatar, Lozenge category,
Logo both products), format, theme, shortcuts, confirm. `tsc --noEmit`, `biome format` in CI (GitHub Actions,
Bun 1.4.2).
