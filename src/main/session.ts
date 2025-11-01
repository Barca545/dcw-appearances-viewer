import { ListEntry, pubDateSort } from "../../core/pub-sort.js";
import { app, BaseWindow, BrowserWindow, dialog, Menu } from "electron";
import path from "node:path";
import { None, Option, Some } from "../../core/option.js";
import { loadList, SaveFormat, sessionFromJSON, sessionToJSON } from "../../core/load.js";
import fs, { PathLike } from "fs";
import { isMac } from "./main.js";
import { FilterOptions, Settings } from "../common/apiTypes.js";

// TODO: If this works I need to make some changes to this

const pagesrootdir = "./src/renderer/";

declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string;
declare const MAIN_WINDOW_VITE_NAME: string;

// For dev if this is true the base needs to be different since a server is being used
if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
} else {
}

class Path {
  private path: string;

  constructor(pathStr: PathLike) {
    // FIXME: Confirm it is a valid path and error if not

    this.path = pathStr.toString();
  }

  /**Returns the name of a path's file if it has one */
  fileName(): Option<string> {
    const name = path.basename(this.path);

    if (typeof name == "undefined") {
      return new None();
    } else {
      return new Some(name);
    }
  }

  /**Returns the filetype of the file the path references. Returns None if there is no extension. */
  type(): Option<string> {
    const ty = path.extname(this.path);
    if (ty == "") {
      return new None();
    } else {
      return new Some(ty);
    }
  }

  toString() {
    return this.path.toString();
  }
}

export class Session {
  sessions: Map<number, Window> = new Map();
  focused: Option<number>;

  constructor() {
    this.focused = new None();
  }

  settings(): Settings {
    const userdata = app.getPath("userData");
    // FIXME: For distribution
    // @ts-ignore
    return JSON.parse(fs.readFileSync("C:/Users/jamar/Documents/Hobbies/Coding/publication_date_sort/settings.json")) as Settings;
    // @ts-ignore
    return JSON.parse(fs.readFileSync(`${userdata}/DCDB Appearances/settings.json`)) as Settings;
  }

  getFocusedSession(): Window {
    return this.sessions.get(this.focused.unwrap()) as Window;
  }

  /**Create a new `Session` in the sessions instance. If no title is provided its title will be `"Untitled" + this.untitledNumber()`. Its key will be its title. */
  async newSession(title?: string): Promise<Window> {
    if (!title) {
      title = "Untitled" + this.untitledNumber();
    }

    const win = await this.newWindow(title);
    const session = new Window(win);
    this.sessions.set(win.id, session);

    return session;
  }

  async newWindow(title?: string, src = pagesrootdir + "index.html"): Promise<BrowserWindow> {
    const currentWindow = BrowserWindow.getFocusedWindow();

    let x, y;
    if (currentWindow) {
      const [curX, curY] = currentWindow.getPosition();
      // TODO: Is hardcoding this number ok?
      x = curX + 24;
      y = curY + 24;
    }

    // TODO: Find a way to persist the user's desired size across restarts
    let win = new BrowserWindow({
      width: this.settings().size.width,
      height: this.settings().size.height,
      title: title ?? undefined,
      x: x,
      y: y,
      webPreferences: {
        contextIsolation: true,
        // enableRemoteModule: false,
        nodeIntegration: false,
        preload: path.join(process.cwd(), "src/preload/preload.js"),
      },
    });
    win.loadFile(path.join(process.cwd(), src));

    win.webContents.on("did-finish-load", () => {
      if (!win) {
        throw new Error('"win" is not defined');
      }

      if (process.env.START_MINIMIZED) {
        win.minimize();
      } else {
        win.show();
        win.focus();
      }
    });

    // TODO: Confirm this should work to make sure the correct window is always focused
    win.on("focus", () => (this.focused = new Some(win.id)));

    win.on("focus", () => (this.focused = new Some(win.id)));

    win.on("blur", () => (this.focused = new None()));

    // This destroys the window instance
    win.on("close", () => this.sessions.delete(win?.id));

    win.setMenu(this.menuTemplate());
    return win;
  }

  menuTemplate(): Menu {
    return Menu.buildFromTemplate([
      {
        label: "File",
        submenu: [
          {
            label: "New",
            accelerator: "CommandOrControl+N",
            click: (_item, base, _e) => {
              browserWindowFrom(base as BaseWindow).loadFile(path.join(process.cwd(), "application.html"));
            },
          },
          {
            label: "Open File",
            accelerator: "CommandOrControl+O",
            click: (_item, base, _e) => {
              const win = browserWindowFrom(base as BaseWindow);
              const session = this.sessions.get(win.id) as Window;
              session.openFile();
            },
          },
          {
            label: "New Window",
            accelerator: "CommandOrControl+Shift+N",
            click: () => this.newWindow(),
          },
          { type: "separator" },
          {
            label: "Save",
            accelerator: "CommandOrControl+S",
            click: (_item, base, _e) => {
              const win = browserWindowFrom(base as BaseWindow);
              const session = this.sessions.get(win.id) as Window;
              session.saveFile();
            },
          },
          {
            label: "Save As",
            accelerator: "CommandOrControl+Shift+N",
            click: (_item, base, _e) => {
              const win = browserWindowFrom(base as BaseWindow);
              const session = this.sessions.get(win.id) as Window;
              session.saveFile(true);
            },
          },
          { type: "separator" },
          {
            label: "Settings",
            // Settings can launch a new window which is how MS word handles it
            click: (_item, base, _e) => {
              const win = browserWindowFrom(base as BaseWindow);
              const session = this.sessions.get(win.id) as Window;
              newChildWindow(session.win, pagesrootdir + "settings.html", true);
            },
          },
          { type: "separator" },
          isMac ? { role: "close" } : { role: "quit" },
        ],
      },
      { role: "editMenu" },
      { role: "viewMenu" },
    ]);
  }

  /**Returns the number of untilted sessions in the sessions object */
  private untitledNumber(): number {
    let num = 0;
    for (const key in this.sessions) {
      if (key.includes("Untitled")) {
        num += 1;
      }
    }
    return num;
  }
}

// TODO: Maybe eventually find a way to stick every part of the program into this structure but for now just using it to store file data works
export class Window {
  // FIXME: Do not list titles in the loaded pages
  win: BrowserWindow;
  // TODO: Don't love initializing it like this
  savePath = new Path("");
  fileData: ListEntry[] = [];
  opt = new FilterOptions();

  constructor(win: BrowserWindow) {
    this.win = win;
  }

  // FIXME: This might be unnecessary since the title is only reset by saving and opening a file
  setTitle(title: string) {
    this.win.title = title;
  }

  getTitle(): Option<string> {
    // TODO: Confirm an untitled
    if (this.win.title != undefined) {
      return new Some(this.win.title);
    } else {
      return new None();
    }
  }

  /** Open a new file for the `Session`. */
  async openFile() {
    const res = await dialog.showOpenDialog({
      filters: [
        { name: "All Files", extensions: ["txt", "json", "xml"] },
        { name: ".txt", extensions: ["txt"] },
        { name: ".json", extensions: ["json"] },
        { name: ".xml", extensions: ["xml"] },
      ],
      properties: ["openFile"],
    });

    const newPath = res.filePaths[0];

    // If the action was canceled, abort and return early
    if (res.canceled || !newPath) {
      return;
    }

    // Update the save path to match the path of the current file
    // TODO: Should this give an error if it fails?
    // FIXME: it did not seem like this was saving I think this is because it was an XML
    // confirm how the json saves and confirm loading it works
    if (newPath) {
      this.savePath = new Path(newPath);
    }

    const ext = this.savePath.type().unwrap();

    // TODO: Set the server side list to list before yeeting it back over.
    let file: SaveFormat;
    if (ext == ".xml")
      file = {
        isAppearances: "DC DATABASE APPEARANCE DATA",
        opt: new FilterOptions(),
        data: loadList(this.savePath.toString()),
      };
    else {
      try {
        // FIXME: My understanding is this catch block should still work but I need to confirm
        file = sessionFromJSON(this.savePath.toString()) as SaveFormat;
      } catch (err) {
        dialog.showErrorBox("Load Failed", (err as Error).message);
        return;
      }
    }

    // Reflow expects fileData to already be set
    this.fileData = file.data;
    this.fileData = this.reflow();

    // Open the page
    this.win.loadFile(path.join(process.cwd(), "application.html"));
    // Send the data over
    this.win.webContents.on("did-finish-load", () => {
      this.win.webContents.send("file-opened", {
        opt: file.opt ?? this.opt,
        data: this.fileData,
      });
    });

    // Changing the window name will make it impossible

    // Set the window name to the title of the file
    this.win.title = path.basename(this.savePath.toString(), this.savePath.type().unwrap());
  }

  /**Save a file to the disk. If `saveas` is  `true` the file operation will be performed as a save as operation.*/
  async saveFile(saveas = false) {
    // If there is no save_path set one or if this is explicitly a save as command
    if (saveas || typeof this.savePath === "undefined" || this.savePath === null) {
      const res = await dialog.showSaveDialog({
        // FIXME: Can't be this and openFile figure out the difference
        properties: ["createDirectory", "showOverwriteConfirmation"],
        filters: [
          { name: ".txt", extensions: ["txt"] },
          { name: ".json", extensions: ["json"] },
        ],
      });

      // Early return if the user cancels
      if (res.canceled || !res.filePath) return;

      // Update the save path
      this.savePath = new Path(res.filePath);

      // Retitle the window
      this.win.title = path.basename(res.filePath, this.savePath.type().unwrap());
    }

    // FIXME: Unclear if a try/catch block is needed
    sessionToJSON(this.opt, this.fileData, this.savePath.toString());
  }

  /**Recalculate the layout of the results section and return the new layout.*/
  reflow(): ListEntry[] {
    let sorted = this.fileData;
    // TODO: Basically move all this logic serverside
    switch (this.opt.sortOrder) {
      case "PUB": {
        sorted = pubDateSort(this.fileData);
        break;
      }
      case "A-Z": {
        // TODO: This type of sorting needs to be checked for correctness
        sorted = sorted.sort((a, b) => {
          if (a.title < b.title) {
            return -1;
          }
          if (a.title > b.title) {
            return 1;
          }
          return 0;
        });
        break;
      }
    }

    // Make sure it does ascendingdescending
    if (!this.opt.ascending) {
      sorted = sorted.reverse();
    }

    return sorted;
  }
}

async function newChildWindow(parent: BrowserWindow, src: string, modal = false) {
  let child = new BrowserWindow({
    width: parent.getSize()[0] / 2,
    height: parent.getSize()[0] / 2,
    parent: parent,
    modal: modal,
    webPreferences: {
      contextIsolation: true,
      // enableRemoteModule: false,
      nodeIntegration: false,
      preload: path.join(process.cwd(), "src/preload/preload.js"),
      // preload: "C:/Users/jamar/Documents/Hobbies/Coding/publication_date_sort/target/src/preload/preload.js",
    },
  });
  child.loadFile(path.join(process.cwd(), src));
  child.setMenu(null);
}

function browserWindowFrom(base: BaseWindow): BrowserWindow {
  const win = BrowserWindow.fromId(base.id);
  if (win) return win;
  else throw new Error(`Window ${base?.id} does not exist.`);
}
