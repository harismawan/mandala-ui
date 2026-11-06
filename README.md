# mandala-ui

Design system shared by Atlas (Confluence replacement) and Loopline (Jira replacement): BNI teal/orange tokens with
dark mode, Inter, lucide icons, React primitives, and both product marks. Spec: `docs/specs/2026-10-05-mandala-ui-design.md`.

Ships TypeScript source and CSS modules; the consumer's `Bun.build` bundles them. No build step.

```jsonc
// apps/web/package.json
"dependencies": { "@harismawan/mandala-ui": "github:harismawan/mandala-ui#v0.2.0", "lucide-react": "^1.52.0" }
```

```ts
import "@harismawan/mandala-ui/styles.css"; // fonts + tokens + global + tooltip
import { Button, Menu, triggerButton, Logo, initTheme, ToastHost } from "@harismawan/mandala-ui";
```

Importing the package installs the portaled tooltip (`[data-tooltip]`, one fixed host on `<body>`); its styles come with
`styles.css`. Content drawn outside React (server-rendered HTML) can reuse a primitive's classes through
`@harismawan/mandala-ui/ui/<Name>.module.css`.

Atlas is the source of truth for the look: a fix made there lands here, and both products bump the tag. Product layout
values (Atlas's wider `--sidebar`) stay overrides in the product.

Peer dependencies: `react`, `react-dom` 19, `lucide-react`. Favicons: `@harismawan/mandala-ui/favicon-atlas.svg`,
`favicon-loopline.svg` (reference them from `index.html` so the bundler hashes them).

Dev: `bun install`, `bun test` (jsdom through the bunfig preload), `bun run typecheck`, `bun run format:check`.
Release: bump `version`, tag `vX.Y.Z`, consumers bump the tag and `bun install`.
