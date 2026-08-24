# Toolbox

Toolbox formats JSON and XML responses directly in the browser. It replaces raw
API responses with searchable, expandable tree views while keeping the original
URL in the address bar.

## Features

- Formats valid `application/json` responses in place.
- Formats valid XML responses in place, except SVG images.
- Filters JSON keys and values as you type.
- Expands XML trees in one action.
- Opens a separate jq workspace for JSON queries without changing the response tab.
- Provides Tokyo Night and Catppuccin themes.
- Stores only the selected theme locally. jq workspace data is held in temporary
  browser session storage.

## Install

Install Toolbox from the Chrome Web Store when it is published. For an unpacked
local build:

1. Install [Node.js 22](https://nodejs.org/) and [pnpm 10](https://pnpm.io/installation).
2. Run `pnpm install`.
3. Run `pnpm build`.
4. Open `chrome://extensions`, enable **Developer mode**, select **Load unpacked**,
   and choose `.output/chrome-mv3`.

## Use

1. Open a URL that returns JSON or XML.
2. Use the tree controls to expand or collapse structured content.
3. For JSON, enter text in the filter field to match keys and scalar values.
4. Select **Open jq** to query the response in a separate Toolbox tab.
5. Select **Back to response** in the jq workspace to return that tab to the
   original URL.
6. Open the extension pop-up to select a theme.

Toolbox only runs on valid JSON and XML documents. It does not alter HTML pages,
plain text responses, or SVG images.

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

- `entrypoints/content.ts`: detects supported response documents and mount the
  in-place viewer.
- `entrypoints/json-viewer`: JSON response and jq workspace views.
- `entrypoints/xml-viewer`: XML response view.
- `entrypoints/popup`: extension settings.
- `entrypoints/background.ts`: temporary `jq` workspace document storage an tab
  creation.
- `wxt.config.ts`: extension manifest and build configuration.

## Releases

To prepare a release, update the version in `package.json` and `pnpm-lock.yaml`
in a pull request. After the pull request merges to `main`, the **Auto-tag
version** workflow creates a tag that matches the package version.

### For maintainers only

To publish the tagged version, open **Actions**, select **Release extension**,
choose the release tag in **Use workflow from**, and run the workflow. It
validates the tag, publishes the Chrome archive to the Chrome Web Store, and
creates or updates the GitHub Release with the Chrome, Firefox, and source
archives. It does not publish to Firefox Add-ons.

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening an issue or pull request.
Report security vulnerabilities as described in [SECURITY.md](SECURITY.md).

## License

Toolbox is licensed under the [MIT License](LICENSE).
