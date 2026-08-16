# Toolbox

Toolbox formats JSON and XML responses directly in the browser. It replaces raw API responses with searchable, expandable tree views while keeping the original URL in the address bar.

## Features

- Formats valid `application/json` responses in place.
- Formats valid XML responses in place, except SVG images.
- Filters JSON keys and values as you type.
- Expands XML trees in one action.
- Opens a separate jq workspace for JSON queries without changing the response tab.
- Provides Tokyo Night and Catppuccin themes.
- Stores only the selected theme locally. jq workspace data is held in temporary browser session storage.

## Install

Install Toolbox from the Chrome Web Store when it is published. For an unpacked local build:

1. Install [Node.js 22](https://nodejs.org/) and [pnpm 10](https://pnpm.io/installation).
2. Run `pnpm install`.
3. Run `pnpm build`.
4. Open `chrome://extensions`, enable **Developer mode**, select **Load unpacked**, and choose `.output/chrome-mv3`.

## Use

1. Open a URL that returns JSON or XML.
2. Use the tree controls to expand or collapse structured content.
3. For JSON, enter text in the filter field to match keys and scalar values.
4. Select **Open jq** to query the response in a separate Toolbox tab.
5. Select **Back to response** in the jq workspace to return that tab to the original URL.
6. Open the extension popup to select a theme.

Toolbox only runs on valid JSON and XML documents. It does not alter HTML pages, plain text responses, or SVG images.

## Development

| Command              | Purpose                                |
| -------------------- | -------------------------------------- |
| `pnpm dev`           | Start a Chromium development browser.  |
| `pnpm dev:firefox`   | Start Firefox development mode.        |
| `pnpm compile`       | Type-check the extension.              |
| `pnpm lint`          | Run ESLint.                            |
| `pnpm build`         | Build a production Chromium extension. |
| `pnpm build:firefox` | Build a production Firefox extension.  |
| `pnpm zip`           | Create the Chromium upload archive.    |
| `pnpm zip:firefox`   | Create the Firefox upload archive.     |

Run `pnpm compile && pnpm lint && pnpm build` before opening a pull request.

### Project layout

- `entrypoints/content.ts`: detects supported response documents and mounts the in-place viewer.
- `entrypoints/json-viewer`: JSON response and jq workspace views.
- `entrypoints/xml-viewer`: XML response view.
- `entrypoints/popup`: extension settings.
- `entrypoints/background.ts`: temporary jq workspace document storage and tab creation.
- `wxt.config.ts`: extension manifest and build configuration.

## Releases

Pushing a version change to `main` creates a tag matching `package.json`.

```sh
pnpm version 0.2.0 --no-git-tag-version
git add package.json pnpm-lock.yaml
git commit -m "chore: release v0.2.0"
git push origin main
```

To publish a tagged release, select its tag in **Use workflow from**, then run **Release extension** from the GitHub Actions tab. The workflow validates the version, builds Chrome and Firefox archives, publishes the Chrome archive, and creates or updates the GitHub Release.

Set these GitHub Actions secrets before the first release: `CHROME_CLIENT_ID`, `CHROME_CLIENT_SECRET`, `CHROME_REFRESH_TOKEN`, `CHROME_EXTENSION_ID`, and `CHROME_PUBLISHER_ID`. Firefox publication also needs a permanent Gecko extension ID and AMO credentials.

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening an issue or pull request. Report security vulnerabilities as described in [SECURITY.md](SECURITY.md).

## License

Toolbox is licensed under the [MIT License](LICENSE).
