# Release checklist

The public source repository is [state-interface](https://github.com/YOU-SHOULD-KNOW-ME/state-interface). The browser playground is deployed from the root of the `main` branch using GitHub Pages. This package is not published on npm.

1. Run `node --test tests/*.test.mjs`.
2. Serve the root over HTTP and check all seven states, completion variants, playback, seeking and reduced motion.
3. Review `ASSETS.md` and the character pack license when adding artwork.
4. Commit and push the source; verify the Pages deployment before announcing changes.

Keep all sprites and `assets/catalog.json` together. Do not add account files, terminal history, desktop app archives, SSH keys, connection settings or passwords to the repository.
