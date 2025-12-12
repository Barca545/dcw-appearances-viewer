import { ReactNode } from "react";
import { Outlet } from "react-router";
import { TabBar } from "./components/TabBar";

// TODO: Does this preclude the need for a real index page?

export default function Layout(): ReactNode {
  return (
    <main className="root" style={{ height: "100%" }}>
      <TabBar />
      <Outlet />
    </main>
  );
}
