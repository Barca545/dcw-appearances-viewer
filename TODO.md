# 0.0.1

## Searching

- [x] Add ability to search for a character's appearances and display them
- [x] Add indication showing a request is bending + indication if a request fails

## Miscellaneous

- [x] The whole dropdown should not be a link, only the text
- [x] Fix renderer files for the start and settings pages are not compiling
- [x] The `ListEntry`s actually need to capture the history field
- [x] Figure out how to have it create a settings file in userdata
- [ ] View should not show dev stuff when packaged
- [x] Open dialog should be a modal
- [ ] Set up resources folder

# 0.0.2

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
- [ ] Save previous searches in a document to autofill them into the search
- [ ] Fetch should return an error if it fails
- [ ] Figure out .asar instead of copying resources

# 0.0.3

## Renderer Refactor

- [ ] Retool pages in React
- [ ] Allegedly no need to await `"dom-content-loaded"`

## Miscellaneous

- [ ] Recent documents list on the start page

# 0.0.5

## Settings

- [ ] Accessibility subsection

## Styling

- [ ] Toggles should use [sliders](https://www.w3schools.com/howto/howto_css_switch.asp)
- [ ] Normal list has purple links `"Name Only"` has blue ones
- [ ] Text Size

## Multiple Tabs

- [x] Exiting a tab should autosave or prompt a save if it is untitled
- [ ] Tab should indicate if unsaved like VSCode

# 0.0.6

## Filtering

- [ ] Add ability to filter for a specific date range

# 0.0.9

- [ ] Multiple Characters
- [ ] Sorting by type of appearance
- [ ] Character inference for `.xml` files
