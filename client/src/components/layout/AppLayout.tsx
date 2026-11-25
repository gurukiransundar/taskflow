import { useState } from "react";
import { Outlet } from "react-router";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import CreateWorkspaceModal from "../workspaces/CreateWorkspaceModal";

export default function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <div className="flex h-screen flex-col bg-slate-950 text-white">
      <Navbar onMenuClick={() => setIsSidebarOpen(true)} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onNewWorkspace={() => setIsCreateOpen(true)}
        />

        <main className="flex-1 overflow-y-auto">
          <Outlet context={{ openCreateWorkspace: () => setIsCreateOpen(true) }} />
        </main>
      </div>

      <CreateWorkspaceModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
    </div>
  );
}