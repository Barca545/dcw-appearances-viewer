import { JSX } from "react";
import "./start.css";
import { TabID } from "src/common/ipcAPI";

export default function Start({ ID }: { ID: TabID }): JSX.Element {
  return (
    <div className="landing-content">
      <button className="ButtonLike" onClick={() => window.API.startTab.openNew(ID)}>
        New
      </button>
      <button className="ButtonLike" onClick={() => window.API.startTab.openFile(ID)}>
        Open
      </button>
    </div>
  );
}
