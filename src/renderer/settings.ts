// When the page loads pull up a copy of the settings and store them

// Instead of including in the function, only call the functions once this is satisfied
window.addEventListener("DOMContentLoaded", async () => {
  registerSave();
  registerFetchData();
});

/**Register Settings Page event listener to handle requesting settings data upon loading.*/
function registerFetchData() {
  // const form = document.querySelector(".settings") as HTMLFormElement;
  // // Set the elements on the settings form to match current settings
  // const settings = window.api.settings.request();
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

      // Send settings update to main process
      window.api.settings.update(data);
    });
  });
}
