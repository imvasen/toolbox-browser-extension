# Toolbox

Toolbox replaces direct JSON responses with a readable, searchable tree view.

## Development

Run `pnpm dev` to launch the Chromium development browser, or `pnpm build` to create a production build.

The JSON viewer uses the Tokyo Night theme. Themes are defined as data in `entrypoints/content.ts`, so further color schemes can be added without changing rendering logic.

## Releases

Pushing a version change to `main` creates a `<version>` tag. The version is read from `package.json`.

```sh
pnpm version 0.2.0 --no-git-tag-version
git add package.json pnpm-lock.yaml
git commit -m "chore: release v0.2.0"
git push origin main
```

The auto-tag workflow does nothing when the `<version>` tag already exists, so bump the version for every release. To publish a tagged release, select its tag from the **Use workflow from** list, then run **Release extension** from the Actions tab. It validates that the tag matches `package.json`, builds Chrome and Firefox archives, uploads and submits the Chrome package to the Chrome Web Store, then creates or updates the matching GitHub Release.

Configure these GitHub Actions secrets before running a release: `CHROME_CLIENT_ID`, `CHROME_CLIENT_SECRET`, `CHROME_REFRESH_TOKEN`, `CHROME_EXTENSION_ID`, and `CHROME_PUBLISHER_ID`. Find the publisher ID in Chrome Web Store Developer Dashboard under **Publisher** > **Settings**. The store listing and privacy details must be complete before Chrome accepts a first submission.

Firefox Add-ons publication needs a permanent Gecko extension ID and AMO credentials.
