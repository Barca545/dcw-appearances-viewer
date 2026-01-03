# 0.0.1

## Searching

- [x] Add ability to search for a character's appearances and display them
- [x] Add indication showing a request is bending + indication if a request fails

## Miscellaneous

- [x] The whole dropdown should not be a link, only the text
- [x] Fix renderer files for the start and settings pages are not compiling
- [x] The `ListEntry`s actually need to capture the history field
- [x] Figure out how to have it create a settings file in userdata
- [x] View should not show dev stuff when packaged
- [x] Open dialog should be a modal
- [x] Set up resources folder

# 0.1.0

## Installation and Uninstallation

- [x] Add desktop shortcut during install
- [x] Add startmenu shortcut during install
- [ ] Copy resources to userdata during install
- [x] Remove shortcuts during uninstall
- [ ] Delete userdata during uninstall

## Renderer Refactor

- [x] Retool pages in React
- [ ] Download the React [DevTools](https://react.dev/link/react-devtools)
- [x] Delete now extraneous `.ts` and `.html` pages
- [ ] Allegedly no need to await `"dom-content-loaded"`

## Logging

- [ ] Create user info file that gets submitted with log reports
- [ ] Add a send logs option to the menu
- [ ] Add ability to send crash reports alongside logs
- [ ] Add renderer logging

## Saving

- [ ] Exiting with unsaved changes prompts user to "Save", "Don't Save", or "Cancel".

## Error Fixes

- [ ] Creating a new project does not reset stored project data
- [x] Prompt on exiting with unsaved changes: Two "Don't Save" buttons
- [x] Prompt on exiting with unsaved changes: No button to exit without saving
- [x] Prompt on exiting with unsaved changes: Clicking "Save" does nothing
- [x] Prompt on exiting with unsaved changes: Clicking any button throws an error saying I illegally attempted to open 'C:\Users\jamar\OneDrive\Documents'
- [ ] Filter options fails on pages; possibly a reflow issue
- [ ] Why is there a `.vite` in the renderer folder?

## Multiple Tabs

- [ ] Tab data stored in main process
- [ ] Updating a tab creates a new tab in the session
- [ ] TabBar has an api listener that causes it to rerender when the main process' tab list is modified
- [ ] `TabBar` added to `Layout`
- [ ] Exiting a tab should autosave or prompt a save if it is untitled
- [ ] Tab should indicate if unsaved like VSCode
- [ ] Style tabs ([guide](https://www.w3schools.com/howto/howto_js_tabs.asp))

# 0.2.0

## Features

- [x] Add markdown save option.
- [x] Add functionality to hide the dates.

## Fixes

- [x] "Save As" should change the tabs savePath
- [ ] Ensure Publish actually publishes.
- [ ] Ensure `settings.json` is created when the app first runs.
- [ ] Ensure autoupdating works.
- [ ] Ensure all files and folders are uninstalled upon app uninstallation.
- [ ] Add error logging to supabase.
- [ ] Switch to [`wtf_wikipedia`](https://www.npmjs.com/package/wtf_wikipedia).
  - [ ] Prevent NaN dates.
  - [ ] Fix issue where synopsis does not load fully.

# 0.3.0 - Robustness Fixes

## Refactor Project

- [ ] Assess whether `Layout` should have a `root` HTML element.
- [ ] Asses whether `<body>` should be the `root` HTML element in `index.html`.
- [ ] Need to clean main up and create submodules.
- [ ] Need to create proper `*.d.ts` files.
- [ ] Remove unused IPC API endpoints.
- [ ] Replace casts with `Options` + `unwrap`s.

## Organize Project

- [ ] Look at how [TS documentation](https://www.typescriptlang.org/docs/handbook/declaration-files/library-structures.html) recommends structuring projects.
- [ ] Standardize documentation.
- [ ] Reorganize exports/imports between APITypes and core types.
- [ ] Many files need more descriptive names.
- [ ] Move types used by multiple modules to whichever is most logical.
- [ ] Update `ARCHITECTURE.md`.

## Add New Tests

- [ ] Update existing tests' file paths.
- [ ] add tests for electron features.
- [ ] Figure out why the renderer files don't need `src/renderer/`.

# 0.4.0 - Updating parsing

## Parsing

- [ ] Switch from handrolled parser to [`wtf_wikipedia`](https://www.npmjs.com/package/wtf_wikipedia) for more robust template parsing.
  - [ ] Need a custom prepass that splits the template into (key, value) pairs
  - [ ] Need to parse bodies of text into HTML
  - [ ] Need to extract appearance type information from the appearances section

# 0.5.0 - Expanding functionality

## Searching

- [ ] Add ability to filter for a specific date range.
- [ ] Add searching multiple characters at once.
- [ ] Add searching multiple earths at once.

# 0.6.0

## QOL

- [ ] Character name recomendations.
- [ ] Save previous searches in a document to autofill them into the search.
- [ ] Add recent documents menu on start page.
- [ ] Select date formatting in settings.

## Styling

- [ ] Expanding the details box on the app page should not cause it to change size - [ ] Tabs should have a min and max size and should brow between them as text content requires.
- [ ] The display options bar should stick to the top of the screen when scrolling.
- [ ] Need a back to top button.
- [ ] Hovering over a details to expand them should trigger the selection mouse ico
- [ ] Text size needs to be scaled better.
- [ ] All sizes should be in something absoulute not `px` units.
- [ ] Add icons to the tabs like a magnifier for the search and gear for settings

# 0.7.0

## Parsing Overhaul

- [ ] Fork wtf_wikipedia.
  - [ ] Add typing.
  - [ ] Enable parsing custom DCDB templates.
  - [ ] Enable parsing nested templates in synopses and appearances.

# 0.8.0

## QOL

- [ ] Character inference for `.xml` files.
- [ ] Sorting by type of appearance.

# 0.9.0

# 1.0.0
