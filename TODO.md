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

- [ ] Retool pages in React
- [ ] Download the React [DevTools](https://react.dev/link/react-devtools)
- [ ] Delete now extraneous `.ts` pages
- [ ] Allegedly no need to await `"dom-content-loaded"`

## Logging

- [ ] Create user info file that gets submitted with log reports
- [ ] Add a send logs option to the menu
- [ ] Add ability to send crash reports alongside logs

## Saving

- [x] Exiting with unsaved changes prompts user to "Save", "Don't Save", or "Cancel".

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

## Organize Project

- [ ] Look at how [TS documentation](https://www.typescriptlang.org/docs/handbook/declaration-files/library-structures.html) recommends structuring projects.
- [ ] Standardize documentation
- [ ] Reorganize exports/imports between APITypes and core types
- [ ] Many files need more descriptive names
- [ ] Move types used by multiple modules to whichever is most logical

## Refactor Project

- [ ] Assess whether `Layout` should have a `root` HTML element
- [ ] Asses whether `<body>` should be the `root` HTML element in `index.html`
- [ ] Need to clean main up and create submodules
- [ ] Need to create proper `*.d.ts` files
- [ ] Remove unused IPC API endpoints

## Add New Tests

- [ ] Update existing tests' file paths
- [ ] add tests for electron features
- [ ] Figure out why the renderer files don't need `src/renderer/`

## Miscellaneous

- [ ] Replace casts with `Options` + `unwrap`s
- [ ] Update architecture.md
- [x] Fetch should return an error if it fails
- [ ] Fix issue where synopsis does not load fully; seems to be an error caused by failing to parse the templates in the synopsis properly.

# 0.3.0

## QOL

- [ ] Character search recomendations when type
- [ ] Save previous searches in a document to autofill them into the search
- [ ] Add recent documents menu option to continue a previous project

## Updating

- [ ] Add autoupdates
- [ ] Add Github releases
- [ ] Have nightly vs prompt options in settings to control update frequency

## Miscellaneous

- [ ] Recent documents list on the start page

# 0.5.0

## Styling

- [ ] Toggles should use [sliders](https://www.w3schools.com/howto/howto_css_switch.asp)
- [ ] Normal list has purple links `"Name Only"` has blue ones
- [ ] Text size needs to be scaled better
- [ ] All sizes should be in something absoulute not `px` units

# 0.6.0

## Filtering

- [ ] Add ability to filter for a specific date range
- [ ] Sorting by type of appearance
- [ ] Multiple Characters

## QOL

- [ ] Character inference for `.xml` files

# 0.7.0

## Accessability

# 0.9.0
