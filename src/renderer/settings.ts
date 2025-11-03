// When the page loads pull up a copy of the settings and store them

// Instead of including in the function, only call the functions once this is satisfied
// TODO: If this works, do it in every other render file
/**Register Settings Page event listener to handle requesting settings data upon loading.*/
async function registerFetchData() {
  let form = document.querySelector(".settings") as HTMLFormElement;
  // Set the elements on the settings form to match current settings
  const settings = await window.api.settings.request();
  console.log(Object.entries(settings));

  // Set the components of the form
  // TODO: Can't iterate over settings currently because it is not flat
  // for (const [key, value] of Object.entries(settings)) {
  //   const field = form.querySelector(`${key}`) as HTMLInputElement;
  //   field.value = value;
  // }

  let width = document.querySelector("width") as HTMLInputElement;
}

/**Register settings page behavior for when the user saves their changes. */
function registerSave() {
  const saveButton = document.querySelector(".save") as HTMLButtonElement;
  window.addEventListener("DOMContentLoaded", async () => {
    saveButton.addEventListener("submit", (e) => {
      e.preventDefault();
      // Convert data to Settings
      const msg = new FormData(e.target as HTMLFormElement);
      const rawData = Object.fromEntries(msg.entries());

      const data = {
        theme: rawData.theme as "system" | "light" | "dark",
        "open in new window": rawData["new-window"] as unknown as boolean,
        "choose-earth-settings": rawData["choose-type"] as "user" | "dropdown",
        size: {
          width: rawData.width as unknown as number,
          height: rawData.height as unknown as number,
        },
      };

      // TODO: Need to add updating the theme based on settings, object not individual toggle
      // TODO: Resize window on change here?
      // TODO: Dropdown should change
      // TODO: Open in new window should not be a setting since I have it as a menu option
      window.api.settings.update(data);
    });
  });
}

function preventSubmit() {
  window.addEventListener("keydown", (e) => {
    const event = e as KeyboardEvent;
    // if (event)
    // TODO: Make it so enter does not submit it only pressing one of the submit buttons
    // Also do not delete from the fields they should always show a value
  });

  window.addEventListener("submit", (e) => {
    // TODO: Also do not delete from the fields they should always show a value
    // This might make the prevent default in the other one unnecessary
    e.preventDefault();
  });
}

window.addEventListener("DOMContentLoaded", async () => {
  registerSave();
  registerFetchData();
  preventSubmit();
});
