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
- [ ] Reasses if Templates are necessary
- [ ] Allegedly no need to await `"dom-content-loaded"`

## Updating

- [ ] Add autoupdates
- [ ] Add Github releases

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

# 0.2.0

## Session saving

- [ ] Every change to a project should mark it as `isDirty`
- [ ] Saving should update a document's `isDirty` to clean
- [x] Store the name of the character as part of save data
- [x] Save prompt [on window exit](https://stackoverflow.com/questions/45677600/)
- [ ] Save as markdown reading list with entries as "`- [ ] [name](link)\n`"
- [x] Open saved files

## Organize project

- [ ] Need to clean main up and create submodules
- [ ] Reorganize exports/imports between APITypes and core types
- [ ] Many files need more descriptive names
- [ ] Move types used by multiple modules to whichever is most logical

## Add new Tests

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

- [ ] Have nightly vs prompt options in settings to control update frequency

## Miscellaneous

- [ ] Recent documents list on the start page

# 0.5.0

## Settings

- [ ] Accessibility subsection

## Styling

- [ ] Toggles should use [sliders](https://www.w3schools.com/howto/howto_css_switch.asp)
- [ ] Normal list has purple links `"Name Only"` has blue ones
- [ ] Text Size

## Multiple Tabs

- [ ] Exiting a tab should autosave or prompt a save if it is untitled
- [ ] Tab should indicate if unsaved like VSCode

# 0.6.0

## Filtering

- [ ] Add ability to filter for a specific date range
- [ ] Sorting by type of appearance
- [ ] Multiple Characters

## QOL

- [ ] Character inference for `.xml` files

# 0.9.0
