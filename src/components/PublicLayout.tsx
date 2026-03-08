import { Outlet } from "react-router-dom";
import { PublicHeader } from "./PublicHeader";

export function PublicLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <PublicHeader />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
