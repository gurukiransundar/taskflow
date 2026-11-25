import { NavLink } from "react-router";
import { useWorkspaces } from "../../hooks/useWorkspaces";
import Button from "../ui/Button";

const linkClasses = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
    isActive
      ? "bg-indigo-600/20 text-white"
      : "text-slate-400 hover:bg-slate-800 hover:text-white"
  }`;

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNewWorkspace: () => void;
}

export default function Sidebar({ isOpen, onClose, onNewWorkspace }: SidebarProps) {
  const { data: workspaces, isLoading, isError } = useWorkspaces();

  return (
    <>
      {/* Dark background behind the sidebar on phones */}
      {isOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={onClose} />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-800 bg-slate-950 p-4 transition-transform md:static md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Close button (phones only) */}
        <div className="mb-4 flex justify-end md:hidden">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            ✕
          </button>
        </div>

        <NavLink to="/dashboard" end onClick={onClose} className={linkClasses}>
          <span>🏠</span> Dashboard
        </NavLink>

        <p className="mt-6 mb-2 px-3 text-xs font-semibold tracking-wider text-slate-500 uppercase">
          Workspaces
        </p>

        <nav className="flex-1 space-y-1 overflow-y-auto">
          {isLoading && (
            <div className="space-y-2 px-3">
              <div className="h-4 animate-pulse rounded bg-slate-800" />
              <div className="h-4 w-2/3 animate-pulse rounded bg-slate-800" />
            </div>
          )}

          {isError && <p className="px-3 text-sm text-red-400">Couldn't load workspaces</p>}

          {workspaces?.length === 0 && (
            <p className="px-3 text-sm text-slate-500">No workspaces yet</p>
          )}

          {workspaces?.map((workspace) => (
            <NavLink
              key={workspace.id}
              to={`/workspaces/${workspace.id}`}
              onClick={onClose}
              className={linkClasses}
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-slate-800 text-xs font-bold text-indigo-300">
                {workspace.name[0].toUpperCase()}
              </span>
              <span className="truncate">{workspace.name}</span>
            </NavLink>
          ))}
        </nav>

        <Button
          variant="secondary"
          fullWidth
          className="mt-4"
          onClick={() => {
            onNewWorkspace();
            onClose();
          }}
        >
          + New workspace
        </Button>
      </aside>
    </>
  );
}