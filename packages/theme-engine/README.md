# @app/theme-engine

The one theme renderer shared by the Backend (PDF) and the Frontend (designer and card preview). It is plain ESM with zero dependencies and uses no Node or browser APIs. Both apps link it with `"@app/theme-engine": "file:../packages/theme-engine"`.

| File | What it does |
|---|---|
| `constants.js` | Layer, pattern, shape, role, blend and fill-to enums, limits, `ENGINE_VERSION` |
| `renderLayers.js` | `renderLayersSvg({ layers, roles, width, height, idPrefix, artworks })` → SVG string |
| `palette.js` | `buildPalette(baseHex, { mode, variant })` → 7 roles with WCAG 4.5:1 contrast |
| `migrations.js` | `migrateTheme(theme)` brings old theme data up to `CURRENT_THEME_SCHEMA` on read |
| `printCheck.js` | `checkPrintSafety(theme, card)` → print warnings (never blocks saving) |

Run the tests with `npm test` here, or `npm run test:theme-engine` in `Backend` (that also runs the SVG sanitiser test).

## Add a preset

1. Add an entry to `Backend/src/constants/themePresets/layeredPresets.js` with `layered({ key, name, description, tags, roles, front, back })`.
2. Use **roles** (`{ role: 'primary' }`) for every main colour, so the palette and Shuffle recolour it. Use `hex` only for colours that must never change.
3. Keep the top ~30% and bottom ~15% calm (photo, name, signature). Check that `text` and `mutedText` on `surface`, and `onPrimary` on `primary`, are at least 4.5:1.
4. Keep coordinates normalised (0..1). The preset then works on every card size and orientation.

## Add a new layer type

1. **Constants**: add the type to `LAYER_TYPES` in `constants.js`.
2. **Joi**: add its schema to `LAYER_TYPE_SCHEMAS` in `Backend/src/validators/templateValidator.js` (clamp numbers, defaults).
3. **Renderer**: add a `renderX(ctx, layer, key)` in `renderLayers.js` and register it in `RENDERERS`. Prefix every id with `key`, validate every colour with `resolveLayerColor`, and never put raw input into the SVG.
4. **Editor**: add defaults in `Frontend/src/utils/themeLayers.js` (`LAYER_DEFAULTS`) and an editor in `LayerEditor.jsx` (`EDITORS`).
5. **Migration**: if the stored format changes, add a step in `migrations.js` and bump `CURRENT_THEME_SCHEMA`.
6. **Test**: add a case in `__tests__/renderLayers.test.js`. If the SVG output of existing layers changes, update the golden hashes and bump `ENGINE_VERSION`.

## Artwork colour slots

A Super Admin uploads an SVG. The server sanitises it and rejects scripts, `on…` handlers, `foreignObject`, external links and `@import`. Any colour a school should be able to change is marked as a **slot**, in one of three ways:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 540 860">
  <defs>
    <linearGradient id="head" x1="0" x2="1">
      <stop offset="0" stop-color="{{primary}}"/>            <!-- token -->
      <stop offset="1" stop-color="{{secondary}}"/>
    </linearGradient>
  </defs>
  <path d="M0 0H540V170Q270 260 0 170Z" fill="url(#head)"/>
  <path d="M0 760Q270 700 540 760V860H0Z" data-slot="wave"/>  <!-- data-slot → fill -->
  <circle cx="470" cy="330" r="46" style="fill: var(--slot-accent, #ccc)"/>
</svg>
```

All three become `{{name}}` in the stored SVG. The Super Admin maps each slot to a role (it then follows the school palette) or to a fixed hex. Schools can override any slot in the layer editor. At render time the tokens are replaced with validated hex colours, and every id inside the artwork is prefixed, so cards and sides never clash.
