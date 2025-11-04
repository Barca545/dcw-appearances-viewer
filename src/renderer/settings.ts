import { Settings } from "../common/apiTypes";

// Instead of including in the function, only call the functions once this is satisfied
// TODO: If this works, do it in every other render file
/**Register Settings Page event listener to handle requesting settings data upon loading.*/
async function registerFetchData() {
  let form = document.querySelector(`[id="settings"]`) as HTMLFormElement;
  // Set the elements on the settings form to match current settings
  const settings = await window.api.settings.request();

  // Set the components of the form
  // TODO: Can't iterate over settings currently because it is not flat
  for (const [key, value] of Object.entries(settings)) {
    let setting = form.querySelector(`[id="${key}"]`) as HTMLInputElement;

    // If it is a collection of radio buttons treat them specially
    if (setting?.tagName == "FIELDSET") {
      let inputs = setting.querySelectorAll(`[name="${key}"]`) as NodeListOf<HTMLInputElement>;
      inputs.forEach((input) => {
        // This will unselect all radios except the one the user selected
        input.checked = input.value == value;
        console.log(input.value);
        console.log(input.checked);
        // input.dispatchEvent(new Event("change", { bubbles: true }));
      });

      continue;
    }
    // Otherwise just set the value
    setting.value = value;
  }
}

/**Register settings page behavior for when the user saves their changes. */
function registerSaveSettings() {
  const saveButtons = document.querySelectorAll(`[class="save-button"]`) as NodeListOf<HTMLButtonElement>;

  saveButtons.forEach((saveButton) => {
    saveButton.addEventListener("click", (e) => {
      // Gotta disable default behavior (which is submitting)
      // TODO: Determine if register Prevent submit already does that or vice versa
      e.preventDefault();
      let form = document.querySelector(`[id="settings"]`) as HTMLFormElement;

      // Convert data to Settings
      const rawData = Object.fromEntries(new FormData(form));
      const data = {
        theme: rawData.theme as "system" | "light" | "dark",
        earthDropdownType: rawData.earthDropdownType as "user" | "external",
        width: rawData.width as unknown as number,
        height: rawData.height as unknown as number,
      } satisfies Settings;

      window.api.settings.save(data);

      // TODO: If name is save and close also close

      if ((e.target as HTMLButtonElement).id.toLowerCase().includes("close")) {
        window.api.finish();
      }
    });
  });
}

function registerPreventSubmit() {
  window.addEventListener("submit", (e) => {
    // This is just here so that "submitting" doesn't wipe the form and try to actually submit.
    e.preventDefault();
  });
}

window.addEventListener("DOMContentLoaded", async () => {
  await registerFetchData();
  registerSaveSettings();
  registerPreventSubmit();
});
