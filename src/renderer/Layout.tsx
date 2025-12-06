import { ReactNode } from "react";
import { Outlet } from "react-router";

// TODO: Does this preclude the need for a real index page?

export default function Layout(): ReactNode {
  return (
    <main className="root">
      <div className="root-container">
        <Outlet />
      </div>
    </main>
  );
}
