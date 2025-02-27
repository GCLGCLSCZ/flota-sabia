
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";

const Layout = () => {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-auto p-6 animate-fade-up dark:bg-gray-900 transition-colors">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
