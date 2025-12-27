import { JSX } from "react";
import "./start.css";
import { TabID } from "src/common/ipcAPI";
import { useParams } from "react-router";

export default function Start(): JSX.Element {
  const { ID } = useParams<Record<"ID", TabID>>();
  if (ID == undefined) {
    throw new Error("Tab must have an ID.");
  }
  return (
    <div className="start-tab">
      <button className="ButtonLike" onClick={() => window.API.startTab.openNew(ID)}>
        New
      </button>
      <button className="ButtonLike" onClick={() => window.API.startTab.openFile(ID)}>
        Open
      </button>
    </div>
  );
}
