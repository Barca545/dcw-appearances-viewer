import { Session } from "./session";

type MenuTemplate = Electron.MenuItemConstructorOptions[];

function devMenuTemplate(session: Session): MenuTemplate {
  return [
    {
      label: "File",
      submenu: [
        {
          label: "New",
          accelerator: "CommandOrControl+N",
          click: (_item, base, _e) => this.get(base?.id as number).loadRenderFile("application.html"),
        },
        {
          label: "New Window",
          accelerator: "CommandOrControl+Shift+N",
          click: (_item, base, _e) => this.sessionChange(this.get(base?.id as number), SessionType.Project),
        },
        {
          label: "Open File",
          accelerator: "CommandOrControl+O",
          click: (_item, base, _e) => {
            const win = browserWindowFrom(base as BaseWindow);

            const session = this.sessions.get(win.id) as Session;
            session.openFile();
          },
        },
        { type: "separator" },
        {
          label: "Save",
          accelerator: "CommandOrControl+S",
          click: (_item, base, _e) => {
            const session = this.sessions.get(base?.id as number) as Session;
            session.saveFile();
          },
        },
        {
          label: "Save As",
          accelerator: "CommandOrControl+Shift+S",
          click: (_item, base, _e) => {
            const session = this.sessions.get(base?.id as number) as Session;
            session.saveFile(true);
          },
        },
        { type: "separator" },
        {
          label: "Settings",
          // Settings can launch a new window which is how MS word handles it
          click: (_item, base, _e) => this.sessionChange(this.get(base?.id as number), SessionType.Settings),
        },
        { type: "separator" },
        isMac ? { role: "close" } : { role: "quit" },
      ],
    },
    { role: "editMenu" },
    { role: "viewMenu" },
  ];
}
