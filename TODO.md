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

- [ ] Add a send logs option to the menu
- [x] Add desktop shortcut during install
- [x] Add startmenu shortcut during install
- [ ] Copy resources to userdata during install
- [x] Remove shortcuts during uninstall
- [ ] Delete userdata during uninstall

## Updating

- [ ] Add Github releases
- [ ] Add stable autoupdate if possible

## Miscellaneous

- [ ] Creating a new project needs to reset the project data being stored
- [ ] Finish unsaved changes exit prompt

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

## Renderer Refactor

- [ ] Retool pages in React
- [ ] Allegedly no need to await `"dom-content-loaded"`

## Miscellaneous

- [ ] Recent documents list on the start page

## QOL

- [ ] Save previous searches in a document to autofill them into the search
- [ ] Add recent documents menu option to continue a previous project

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
