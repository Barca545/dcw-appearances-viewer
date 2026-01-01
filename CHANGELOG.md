# v0.1.2-PRERELEASE

## Fixes

- Corrected installation error where `settings.json` was not created on first run.

## Features

- Added option to remove dates from appearance lists.
- Added option to save as a [Markdown](https://en.wikipedia.org/wiki/Markdown) (.md) list in addition to saving as a JSON.

## Known Bugs

- The current parser is still unable to handle some sections (appearances and synopses) of a page. As a result, page data for more complex sections likely has corrupted data. This will not affect basic appearance information but may result in unexpected typos in synopses.
- If two startabs are opened simultaneously, they cannot be closed.
