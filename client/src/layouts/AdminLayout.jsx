import React from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";

const AdminLayout = () => {
  return (
    <div className="mx-auto max-w-7xl w-full px-6 flex flex-col md:flex-row min-h-[80vh] text-left flex-1">
      <AdminSidebar />
      <div className="flex-1 min-w-0 p-6 md:p-10 flex flex-col">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;
