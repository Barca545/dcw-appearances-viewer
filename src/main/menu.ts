import { Session } from "./session";
import { UNIMPLEMENTED_FEATURE, IS_MAC, IS_DEV } from "./main_utils";
import { dialog } from "electron";
import { AppPage } from "../common/apiTypes";
import { None, Option, Some } from "../../core/option";

type MenuTemplate = Electron.MenuItemConstructorOptions[];
type MenuEntry = Electron.MenuItemConstructorOptions;

export function MenuTemplate(session: Session): MenuTemplate {
  return [
    {
      label: "File",
      submenu: [
        {
          label: "New",
          accelerator: "CommandOrControl+N",
          click: (_item, _base, _e) => session.openAppPage(AppPage.Application),
        },
        {
          label: "New Tab",
          accelerator: "CommandOrControl+Shift+N",
          click: (_item, _base, _e) => UNIMPLEMENTED_FEATURE(),
        },
        {
          label: "Open File",
          accelerator: "CommandOrControl+O",
          click: (_item, _base, _e) => session.openFile(),
        },
        { type: "separator" },
        { role: "recentDocuments", click: (_item, _base, _e) => UNIMPLEMENTED_FEATURE() },
        { type: "separator" },
        {
          label: "Save",
          accelerator: "CommandOrControl+S",
          click: (_item, _base, _e) => session.saveFile(false),
        },
        {
          label: "Save As",
          accelerator: "CommandOrControl+Shift+S",
          click: (_item, _base, _e) => session.saveFile(true),
        },
        { type: "separator" },
        {
          label: "Settings",
          accelerator: "CommandOrControl+,",
          // TODO: Once tabbing is set up, just have the settings open in a new tab
          click: (_item, _base, _e) => UNIMPLEMENTED_FEATURE(),
        },
        { type: "separator" },
        IS_MAC ? { role: "close" } : { role: "quit" },
      ],
    },
    { role: "editMenu" },
    IS_DEV ? VIEW_MENU_DEV : VIEW_MENU_PROD,
  ];
}

const VIEW_MENU_DEV: MenuEntry = {
  label: "View",
  submenu: [{ role: "zoomIn" }, { role: "zoomOut" }, { role: "resetZoom" }, { type: "separator" }, { role: "toggleDevTools" }],
};
const VIEW_MENU_PROD: MenuEntry = { label: "View", submenu: [{ role: "zoomIn" }, { role: "zoomOut" }, { role: "resetZoom" }] };

// Dialogs
/** Returns `None` if the action is cancelled */
export function openFileDialog(): Option<string> {
  const res = dialog.showOpenDialogSync({
    filters: [
      { name: "All Files", extensions: ["txt", "json", "xml"] },
      { name: ".txt", extensions: ["txt"] },
      { name: ".json", extensions: ["json"] },
      { name: ".xml", extensions: ["xml"] },
    ],
    properties: ["openFile"],
  });

  return res ? new Some(res[0]) : new None();
}
