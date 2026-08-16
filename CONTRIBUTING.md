# Contributing to Toolbox

## Before You Start

Open an issue before starting substantial work. Describe the problem, proposed behavior, and browser impact.

## Development Setup

1. Install Node.js 22 and pnpm 10.
2. Run `pnpm install`.
3. Run `pnpm dev` to load the extension in a Chromium development browser.

## Pull Requests

- Keep each pull request focused on one behavior change.
- Update the README when user-visible behavior changes.
- Do not add browser permissions without explaining why they are needed.
- Run `pnpm compile && pnpm lint && pnpm build` before requesting review.
- Include manual test steps for response handling changes.

## Reporting Bugs

Use the bug report template. Include the response content type, browser version, extension version, expected behavior, and actual behavior. Remove credentials and sensitive response data before posting.
