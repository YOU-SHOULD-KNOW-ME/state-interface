# Integration contract

The display interface accepts exactly seven state IDs: `offline`, `connecting`, `idle`, `working`, `waiting`, `complete`, `error`.

The host owns activity detection, state precedence, event deduplication and error meaning. Do not infer task completion from an open socket or SSH heartbeat. Never give this renderer credentials or private transcript text; it only needs a state ID.

## Lifecycle

1. Create one controller per visible character.
2. Set state when a host event changes it.
3. For a new completion event while already complete, call `setState('complete', {restart: true})`.
4. Keep the selected completion variant for the entire event. Repeated display refreshes must not retrigger it.
5. Return to idle when the host chooses. The optional adapter uses a 12-second completion lease and discards very stale activity.
6. Call `destroy()` on unmount.

By default hidden pages stop animation scheduling, and system reduced-motion preferences stop automatic animation. Explicit `renderAt()` still permits a deterministic presentation. Film rendering can set `respectReducedMotion: false` and `autoplay: false` and supply time directly.

The `assetsUrl` option points at a directory containing `catalog.json` and its referenced PNG subdirectories. It defaults to the package's `assets/` directory relative to `src/index.js`, making the package portable under nested HTTP paths. All URLs remain relative; no CDN is required.

The canvas output includes the character and decorative effects. A host can draw this canvas into its own scene. Visual completion means a host-reported round ended, not that a software project has passed acceptance.
