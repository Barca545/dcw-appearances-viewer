import { ReactNode } from "react";
import { Outlet, useParams } from "react-router";
import TabBar from "./components/TabBar";
import { TabID } from "src/common/ipcAPI";

// TODO: Does this preclude the need for a real index page?

// TODO: Add css
// - TabBar needs as much space as its size
// - Outlet should get everything else

const MainStylesheet: React.CSSProperties = { display: "flex", flexDirection: "column", height: "100vh" };

const TabBarStylesheet: React.CSSProperties = { flex: "0 0 auto", position: "static", padding: "0", margin: "0", border: "0" };

const OutletStylesheet: React.CSSProperties = { flex: "1 1 auto", overflow: "auto", padding: "0", margin: "0", border: "0" };

export default function Layout(): ReactNode {
  const { ID } = useParams<Record<"ID", TabID>>();
  return (
    <main className="root" style={MainStylesheet}>
      <div className="tabbar-wrapper" style={TabBarStylesheet}>
        <TabBar />
      </div>
      <div className="outlet" style={OutletStylesheet}>
        <Outlet key={ID} />
      </div>
    </main>
  );
}
