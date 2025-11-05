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
        console.log(key);
        console.log(value);
        // This will unselect all radios except the one the user selected
        input.checked = input.value == value;
        // input.dispatchEvent(new Event("change", { bubbles: true }));
      });

      continue;
    } else if (setting.type == "checkbox") {
      // console.log(setting.name);
      setting.checked = value;
    } else {
      setting.value = value;
    }
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
      const data = htmlFormtoSettings(form);

      window.api.settings.save(data);

      // TODO: If name is save and close also close

      if ((e.target as HTMLButtonElement).id.toLowerCase().includes("close")) {
        window.api.settings.close();
      }
    });
  });
}

function registerHandleFontSize() {
  const setValues = () => {
    const useDefault = document.querySelector(`[id="fontSizeUseDefault"]`) as HTMLInputElement;
    let size = document.querySelector(`[id="fontSizeChoose"]`) as HTMLInputElement;
    let wrapper = document.querySelector(`[id=fontSizeChooseWrapper]`) as HTMLSpanElement;
    size.disabled = useDefault.checked;
    wrapper.hidden = useDefault.checked;
    size.value = "16";
  };

  // TODO: Idk if there is a fix but annoyingly this has to run here
  // Because it can't detect the change as it happens before this listener is added
  setValues();

  const fontsizewrapper = document.querySelector(`[id="fontSize"]`) as HTMLFieldSetElement;
  fontsizewrapper.addEventListener("change", () => {
    setValues();
  });
}

function registerPreventSubmit() {
  window.addEventListener("submit", (e) => {
    // This is just here so that "submitting" doesn't wipe the form and try to actually submit.
    e.preventDefault();
  });
}

function registerPreviewSettings() {
  const form = document.querySelector(`[id="settings"]`) as HTMLFormElement;
  form.addEventListener("change", () => {
    const data = htmlFormtoSettings(form);
    window.api.settings.apply(data);
  });
}

window.api.dataRequest("dummy data");

window.addEventListener("DOMContentLoaded", async () => {
  await registerFetchData();
  registerHandleFontSize();
  registerSaveSettings();
  registerPreventSubmit();
  registerPreviewSettings();
  // window.addEventListener("close", (_) => window.api.settings.close());
});

function htmlFormtoSettings(form: HTMLFormElement): Settings {
  const rawData = Object.fromEntries(new FormData(form));
  const data = {
    theme: rawData.theme as "system" | "light" | "dark",
    earthDropdownType: rawData.earthDropdownType as "user" | "external",
    width: rawData.width as string,
    height: rawData.height as string,
    fontSizeUseDefault: rawData.fontSizeUseDefault as "true" | "false",
    fontSizeChoose: rawData.fontSizeChoose as string,
  } satisfies Settings;

  return data;
}
