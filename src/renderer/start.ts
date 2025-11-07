import { AppPage } from "../common/apiTypes";

// TODO: Function is probably unneeded tbh
function navigate() {
  let newProjectButton = document.querySelector(`[id="new-project"]`) as HTMLButtonElement;
  newProjectButton.addEventListener("click", (_e) => window.api.open.page(AppPage.Application));

  let openProjectButton = document.querySelector(`[id="open-project"]`) as HTMLButtonElement;
  openProjectButton.addEventListener("click", (_e) => window.api.open.file());
}

window.addEventListener("DOMContentLoaded", async () => {
  navigate();
});
