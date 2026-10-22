# Character packs

The project is **state-interface**. Characters are replaceable assets, not part of the semantic state contract.

```js
import { createStateInterface } from '../src/index.js';
const actor = await createStateInterface({
  canvas: document.querySelector('canvas'),
  assetsUrl: new URL('./my-character/', location.href)
});
actor.setState('working');
```

Serve a pack directory containing `catalog.json` and all referenced image files. The URL must end in `/`. Cross-origin packs require CORS permission. Only load packs you trust.

## Catalog format (version 1)

```json
{
  "version": 1,
  "character": {"id": "your-character", "name": "Your Character"},
  "canvas": [384, 512],
  "states": {
    "idle": {
      "variants": {
        "default": {
          "files": ["idle/0.png", "idle/1.png"],
          "sequence": [
            {"frame": 0, "durationMs": 1600},
            {"frame": 1, "durationMs": 120}
          ],
          "loop": true
        }
      }
    }
  }
}
```

The example shows only one state. Supply all seven: `offline`, `connecting`, `idle`, `working`, `waiting`, `complete`, `error`. Every state needs at least one variant. Variant IDs are arbitrary strings; `random` is reserved for selection. Explicit variant IDs must exist for the requested state. Each sequence step indexes its variant's `files` array and has a positive duration in milliseconds. All images in a pack must share the declared positive integer canvas dimensions and consistent character registration. Use transparent PNGs, complete-character frames and sufficient margins for every pose.

`loop: true` repeats a timeline. `loop: false` holds the final frame. Random variants are chosen once on entry. The host decides when a completion becomes idle; no automatic status detection is provided.

## Optional decorations

The included pack uses `effect` objects with `kind` (`questions` or `sleep`), `frames` (image indexes) and `staggerMs`. Their positions are designed for Book Companion and scaled from a 384×512 reference. Other characters should omit these effects and draw their own decorations in full frames if the placement does not fit. Arbitrary decoration coordinates are not yet configurable.

The renderer uses the catalog's canvas size. The included playground's labels and completion controls demonstrate the included pack; a custom host should build its controls from its own catalog. No runtime character picker or alternate role artwork is shipped.

## Compatibility checklist

- Keep the seven state names stable.
- Register full-body frames against one shared baseline.
- Keep variants and file paths local to the pack directory.
- Include provenance, permission and license information for your artwork.
- Verify every transition, both completion variants if provided, and reduced-motion behavior.
