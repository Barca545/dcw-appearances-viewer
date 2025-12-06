import { ReactNode } from "react";
import { Link } from "react-router";
import "./start.css";

export default function Start(): ReactNode {
  return (
    <div className="landing-content">
      <Link to={"app"} className="ButtonLike">
        New
      </Link>
      <button className="ButtonLike" onClick={() => window.API.open.file()}>
        Open
      </button>
    </div>
  );
}
