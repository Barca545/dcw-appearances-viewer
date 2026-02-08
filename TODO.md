# 0.0.1

## Searching

- [x] Add ability to search for a character's appearances and display them
- [x] Add indication showing a request is bending + indication if a request fails

## Miscellaneous

- [x] The whole dropdown should not be a link, only the text
- [x] Fix renderer files for the start and settings pages are not compiling
- [x] The `IssueData`s actually need to capture the history field
- [x] Figure out how to have it create a settings file in userdata
- [x] View should not show dev stuff when packaged
- [x] Open dialog should be a modal
- [x] Set up resources folder

# 0.1.0

## Renderer Refactor

- [x] Retool pages in React
- [ ] Download the React [DevTools](https://react.dev/link/react-devtools)
- [x] Delete now extraneous `.ts` and `.html` pages

## Saving

- [x] Exiting with unsaved changes prompts user "Save", "Don't Save", or "Cancel".

## Error Fixes

- [x] Prompt on exiting with unsaved changes: Two "Don't Save" buttons
- [x] Prompt on exiting with unsaved changes: No button to exit without saving
- [x] Prompt on exiting with unsaved changes: Clicking "Save" does nothing
- [x] Prompt on exiting with unsaved changes: Clicking any button throws an error saying I illegally attempted to open 'C:\Users\jamar\OneDrive\Documents'

## Multiple Tabs

- [x] Tab data stored in main process
- [x] Updating a tab creates a new tab in the session
- [x] TabBar should rerender when the main process' tab list is modified
- [x] `TabBar` added to `Layout`
- [x] Exiting a tab should autosave or prompt a save if it is untitled
- [x] Tab should indicate if unsaved like VSCode
- [x] Style tabs ([guide](https://www.w3schools.com/howto/howto_js_tabs.asp))

# 0.2.0

## Features

- [x] Add markdown save option.
- [x] Add CSV save option.
- [x] Add functionality to hide the dates.

## Publishing

- [x] Ensure publish actually publishes instead of just creating a draft.
- [ ] Add custom description to publish instead of it using the default.

## Switch to NSIS installer

- [ ] Ensure `settings.json` is created when the app first runs.
  - [ ] Define NSIS startup behaviour.
  - [ ] Replace squirrel startup handler with NSIS script.
- [x] Ensure autoupdating works.
- [x] Ensure all files and folders are uninstalled upon app uninstallation.
- [x] Prevent app from launching multiple times during first run.
- [x] Ensure shortcuts are created.

## Logging and Error Reports

- [x] Create user info file that gets submitted with log reports.
- [ ] Add main logging.
- [ ] Add preload logging.
- [ ] Add renderer logging.
- [ ] Add [crash](https://www.electronjs.org/docs/latest/api/crash-reporter) logging.
- [ ] Add user feedback.
  - [x] Remove Sentry default button.
  - [ ] Allow attaching files.
  - [ ] Confirm error form alerts users when image is too large.
  - [ ] Confirm error form validates attachments based on type.
  - [ ] Close report window on submit.

## Error Fixes

- [x] Parser is inferring dates for issues with dates, i.e. Heroes in Crisis.
- [x] Sort fetch results before displaying them.
- [x] Too many dates tagged as inferred.
- [x] "Save As" should change the tab's savePath.
- [x] Creating a new project does not reset stored project data.
- [x] Filter options fails on pages; possibly a reflow issue.
- [x] `.vite` created in renderer folder.
- [ ] Opening error window causes session to hallucinate a new tab.

# 0.3.0 - Robustness Fixes

## Refactor Project

- [ ] Assess whether `Layout` should have a `root` HTML element.
- [ ] Asses whether `<body>` should be the `root` HTML element in `index.html`.
- [ ] Evaluate need for proper `*.d.ts` files.
- [ ] Remove unused IPC API endpoints.
- [ ] Replace casts with `Options` + `unwrap`s.
- [ ] Variables for paths being in utils errors if not part of an app instance
- [ ] Only create settings file during start up. If no settings during runtime use default and log error.
- [ ] Fix punycode problem (use `npm ls punycode` to see dependants)

## Organize Project

- [ ] Need to clean main up and create submodules.
- [ ] Look at how [TS documentation](https://www.typescriptlang.org/docs/handbook/declaration-files/library-structures.html) recommends structuring projects.
- [ ] Standardize documentation.
- [ ] Reorganize exports/imports between APITypes and core types.
- [ ] Many files need more descriptive names.
- [ ] Move types used by multiple modules to whichever is most logical.
- [ ] Update `ARCHITECTURE.md`.

## Update and Add Tests

- [ ] Update existing tests' file paths.
- [ ] add tests for electron features.
- [ ] Figure out why the renderer files don't need `src/renderer/`.

# 0.4.0 - Updating parsing

## Parsing

- [ ] Switch from handrolled parser to [`wtf_wikipedia`](https://www.npmjs.com/package/wtf_wikipedia) for more robust template parsing.
  - [ ] Need a custom prepass that splits the template into (key, value) pairs
  - [ ] Need to parse bodies of text into HTML
  - [ ] Need to extract appearance type information from the appearances section
  - [ ] Enable parsing nested templates in synopses and appearances.
- [ ] Prevent NaN dates.
- [ ] Fix issue where synopsis does not load fully.

# 0.5.0 - Expanding functionality

## Searching

- [ ] Add ability to filter for a specific date range.
- [ ] Add searching multiple characters at once.
- [ ] Add searching multiple earths at once.
- [ ] Add filtering by type of appearance

# 0.6.0

## QOL

- [ ] Order of date display option.
- [ ] Character name recomendations.
- [ ] Save previous searches in a document to autofill them into the search.
- [ ] Add recent documents menu on start page.
- [ ] Select date formatting in settings.
- [ ] Ctrl + N on a start page should make the new search inside the start page.
- [ ] Add a back to top button.

## Delete Unneeded Features

- [ ] Delete custom logger (if Sentry works).
- [ ] Delete custom error boundry (if Sentry works).
- [ ] Delete "Diagnostic data" field from user feedback form (if Sentry works).
- [ ] Delete squirrel installer logic (if NSIS works).

# 0.7.0

## Styling

- [ ] Expanding the details box on the app page should not cause it to change size - [ ] Tabs should grow between preset min and max size as text content requires.
- [ ] The display options bar should stick to the top of the screen when scrolling.
- [ ] Hovering over a details to expand them should trigger the selection mouse ico
- [ ] Text size needs to be scaled better.
- [ ] All sizes should be in something absoulute not `px` units.
- [ ] Add icons to the tabs like a magnifier for the search and gear for settings.

# 0.8.0

## QOL

- [ ] Character inference for `.xml` files.
- [ ] Sorting by type of appearance.

# 0.9.0

## Security

- [ ] Add true file validation in the upload component.

# 1.0.0
