# v0.1.5-PRERELEASE

## Features

- Automatically sends crash reports on next startup

## Bug Fixes

- Addressed parsing error caused by header boxes on templates

## Known Bugs

# v0.1.4-PRERELEASE

## Features

- Automatic updates are here!
- Added the option to export as Markdown.
- Added the option to export as a CSVs.

## Bug Fixes

- Lists are actually sorted!

# v0.1.3-PRERELEASE

## Features

- Minor appearance tweaks to the tab bar (say hello to the scroll bar).
- Added a button to hide dates.

## Bug Fixes

- Start tabs can now be closed.
- Settings are properly created during installation.

## Known Bugs

- The current parser is still unable to handle some sections of the page template. This will not affect basic appearance information but may result in unexpected typos in synopses. **Expected repair: v0.4.0**.
- The parser code which handle extracting appears to be treating some non-missing dates as missing dates and replacing them with the base date "1/1/1".

# v0.1.2-PRERELEASE

## Features

- Added option to remove dates from appearance lists.
- Added option to save as a [Markdown](https://en.wikipedia.org/wiki/Markdown) (.md) list in addition to saving as a JSON.

## Bug Fixes

- Corrected installation error where `settings.json` was not created on first run.

## Known Bugs

- The current parser is still unable to handle some sections (appearances and synopses) of a page. As a result, page data for more complex sections likely has corrupted data. This will not affect basic appearance information but may result in unexpected typos in synopses.
- If two startabs are opened simultaneously, they cannot be closed.
