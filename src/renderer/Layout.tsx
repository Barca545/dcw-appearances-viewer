import { ReactNode } from "react";
import { Outlet } from "react-router";

// TODO: Does this preclude the need for a real index page?
// TODO: Add tabs

// https://stackoverflow.com/questions/42495731/should-i-use-react-router-for-a-tabs-component

// function TabsLayout() {
//   return (
//     <div>
//       <TabBar />
//       <Outlet /> {/* active tab content goes here */}
//     </div>
//   );
// }

// import { NavLink } from "react-router-dom";

// function TabBar() {
//   return (
//     <nav>
//       <NavLink to="/tab1">Tab 1</NavLink>
//       <NavLink to="/tab2">Tab 2</NavLink>
//       <NavLink to="/tab3">Tab 3</NavLink>
//     </nav>
//   );
// }

export default function Layout(): ReactNode {
  return (
    <main className="root">
      <div className="root-container">
        <div className="wrapper">
          <Outlet />
        </div>
      </div>
    </main>
  );
}
