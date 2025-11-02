# General

- [ ] View needs to not show dev stuff when packaged
- [ ] Toggles should use [sliders](https://www.w3schools.com/howto/howto_css_switch.asp)
- [ ] Could stand to be a bit prettier
- [ ] Hot reloading does not work for ts because it does not recompile
- [ ] All of the isMac stuff should be something that can be handled during compilation
- [ ] Confirm sessions supports multiple sessions at once
- [ ] Probably worth it to switch to react for later versions since it is easier to handle the kind of reactive changes I want to do
- [ ] If the session it is being issued from is already active `openFile` should create a new window (well follow those settings) not automatically overwrite the current session
- [ ] Attempting to open a new file in a window with an existing project should prompt you to save first.
- [ ] Every change to a document should mark it as `isDirty`.
- [ ] Save to markdown reading list that formats each entry as "`- [ ] [name](link)\n`"
- [ ] Tests need to be completely reworked and new ones added now the file structure changed
- [ ] Update architecture.md
- [ ] See https://stackoverflow.com/questions/76319694/ to create multiple windows
- [ ] Startup includes option to continue last project
- [ ] I want to add the ability to guess which character a raw xml file is for but this is low priority
- [ ] Normal list has purple links `"Name Only"` has blue ones

# Urgent Pre-alpha

- [x] The whole dropdown should not be a link, only the text
- [x] Fix renderer files for the start and settings pages are not compiling
- [x] The `ListEntry`s actually need to capture the history field
- [x] Figure out how to have it create a settings file in userdata
- [ ] Actually implement settings file
- [ ] Need to figure out why the renderer files don't need `src/renderer/` but seem to include the
- [ ] Need to clean main up and create submodules, in general need to organize project
- [ ] Be cool if the lists could be saved
- [ ] Store the name of the character as part of save data so it can be used to show who the appearances belong to
