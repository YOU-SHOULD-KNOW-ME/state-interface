# State Interface

A character-independent, framework-neutral canvas interface for agent activity states. Give it a state; a character brings it to life. Book Companion is the first included character pack.

**[Live playground](https://YOU-SHOULD-KNOW-ME.github.io/state-interface/)** · [Character pack guide](docs/CHARACTER_PACKS.md) · [Integration](docs/INTEGRATION.md)

**This is a community visual component, not an official Anthropic SDK.** It does not detect Claude activity, log into an account, connect to SSH, read a terminal, or send model requests. Your application supplies the state.

## Quick start

No dependency installation or build step is required for the browser example:

```sh
python3 -m http.server 8080 --bind 127.0.0.1
```

Open `http://localhost:8080/` for the interactive playground, or `/examples/gallery.html` for the compact example. Serve over HTTP; ES modules and asset loading do not work reliably with `file://`.

```html
<canvas id="companion" style="width:156px;height:208px"></canvas>
<script type="module">
  import { createStateInterface } from './src/index.js';
  const actor = await createStateInterface({
    canvas: document.querySelector('#companion'),
    initialState: 'idle'
  });
  actor.setState('working');
  // Later, after YOUR application receives a completion event:
  actor.setState('complete', { restart: true });
</script>
```

## Character packs

Load another compatible role with `assetsUrl: new URL("./my-character/", location.href)`. The seven semantic state names stay the same; artwork, canvas dimensions, timelines and variant names belong to the pack. See [the character pack guide](docs/CHARACTER_PACKS.md). `createCompanion` remains a compatibility alias.

## Seven states

| State | Animation |
| --- | --- |
| `offline` | Hug book, close eyes, nap; three Z marks drift above the head |
| `connecting` | Raise hand and adjust the flower ornament |
| `idle` | Natural full-character blink sequence |
| `working` | Read, turn pages, write |
| `waiting` | Look up, tilt head, palm-up invitation |
| `complete` | Random victory gesture or checkmark paddle |
| `error` | Puzzled head scratch; three question marks pop in sequentially |

All 52 PNGs are complete character frames, with a shared 384x512 canvas and registered shoe baseline. No isolated eye/hand patches are used. Completion variants are selected once on state entry, with equal probability. A same-state update does not reroll; pass `restart: true` for a genuinely new completion event. Completion holds its final pose; your host decides when to return to idle.

## API

- `createStateInterface({canvas | container, assetsUrl?, initialState?, variant?, autoplay?, respectReducedMotion?, random?, onStateChange?}) -> Promise<controller>`
- `setState(state, {restart?: boolean, variant?: 'random' | 'default' | 'victory' | 'sign'})`
- `pause()`, `play()`, `setSpeed(multiplier)`
- `seek(milliseconds)` / `renderAt(milliseconds)`
- `getSnapshot()` returns state, chosen variant, elapsed time, duration, current frame and playing flag.
- `destroy()` cancels scheduling and removes listeners. It removes only a canvas it created itself.
- `controller.canvas` is the rendered output, including decorative question marks and ZZZ.

`default` is the variant for non-completion states. `victory` and `sign` apply only to `complete`. Invalid states/variants throw. The canvas is transparent; its surrounding UI belongs to the host.

## Deterministic film use

```js
const actor = await createStateInterface({ canvas, autoplay: false, respectReducedMotion: false });
actor.setState('complete', { variant: 'sign', restart: true });
actor.renderAt(1600);
```

Choose a variant once for a scene, then render or seek to any timestamp. Seeking does not reroll. The completed output can be composited with `drawImage(actor.canvas, ...)` into a larger video canvas. This package does not itself export MP4 or supply speech/audio.

## Optional adapter

`src/adapters.js` demonstrates how a host can map connection and task events. `observedAt` is a Unix timestamp in seconds. A connected transport alone means idle, not working or complete. The adapter performs no I/O and does not automatically schedule refreshes; call `refresh()` when your host clock requires expiry checks.

```js
import { createStatusAdapter } from './src/adapters.js';
const status = createStatusAdapter(actor);
status.setConnection('live');
status.setActivity({ state: 'working', observedAt: Date.now() / 1000 });
```

## Repository and release

Source: [state-interface](https://github.com/YOU-SHOULD-KNOW-ME/state-interface). The package is not published on npm. Clone or download the repository to use it. Run `node --test tests/*.test.mjs` to check timeline and adapter semantics. See `docs/INTEGRATION.md` and `docs/RELEASE.md` before publishing.

Code is MIT licensed. Read `ASSETS.md` for illustration provenance and trademark scope. Slight hair/clothing differences remain between generated keyframes, matching the approved source animations.
