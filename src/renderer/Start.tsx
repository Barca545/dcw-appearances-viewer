import { JSX } from "react";
import "./start.css";

export default function Start(): JSX.Element {
  return (
    <div className="landing-content">
      <button className="ButtonLike" onClick={() => window.API.open.tab()}>
        New
      </button>
      <button className="ButtonLike" onClick={() => window.API.open.file()}>
        Open
      </button>
    </div>
  );
}
