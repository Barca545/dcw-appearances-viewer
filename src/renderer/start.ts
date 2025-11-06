import { AppPage } from "../common/apiTypes";

function navigate() {
  Array.from(document.getElementsByClassName("nav-button")).forEach((button) => {
    button.addEventListener("click", (e) => {
      const target = e.target as HTMLButtonElement;

      // No need to prevent default on e since type button don't default to submit
      window.api.open.page(target.value);
    });
  });
}

console.log(`WINDOW API:`);
console.log(window.api);

window.addEventListener("DOMContentLoaded", async () => {
  navigate();
});
