import { ReactNode } from "react";
import { Outlet, useParams } from "react-router";
import TabBar from "./components/TabBar";
import { TabID } from "src/common/ipcAPI";

// TODO: Does this preclude the need for a real index page?

export default function Layout(): ReactNode {
  const { ID } = useParams<Record<"ID", TabID>>();
  return (
    <main className="root" style={{ height: "100%" }}>
      <TabBar />
      <Outlet key={ID} />
    </main>
  );
}
