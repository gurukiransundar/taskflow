import { Link, useOutletContext } from "react-router";
import { useAuth } from "../hooks/useAuth";
import { useWorkspaces } from "../hooks/useWorkspaces";
import Button from "../components/ui/Button";
import type { Role } from "../types";

// What AppLayout shares with its pages (File 12)
interface LayoutContext {
  openCreateWorkspace: () => void;
}

const roleStyles: Record<Role, string> = {
  ADMIN: "bg-indigo-500/15 text-indigo-300",
  MEMBER: "bg-emerald-500/15 text-emerald-300",
  VIEWER: "bg-slate-500/20 text-slate-300",
};

export default function DashboardPage() {
  const { user } = useAuth();
  const { openCreateWorkspace } = useOutletContext<LayoutContext>();
  const { data: workspaces, isLoading, isError, refetch } = useWorkspaces();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-8">
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Welcome, {user?.name} 👋</h1>
          <p className="mt-1 text-slate-400">Here are your workspaces.</p>
        </div>
        <Button onClick={openCreateWorkspace}>+ New workspace</Button>
      </div>

      {/* Loading: grey placeholder cards */}
      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-36 animate-pulse rounded-2xl bg-slate-900" />
          ))}
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-center">
          <p className="text-red-300">Couldn't load your workspaces.</p>
          <Button variant="secondary" size="sm" className="mt-3" onClick={() => refetch()}>
            Try again
          </Button>
        </div>
      )}

      {/* Empty: no workspaces yet */}
      {workspaces?.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-700 p-12 text-center">
          <div className="text-4xl">🗂️</div>
          <h2 className="mt-4 text-lg font-semibold">No workspaces yet</h2>
          <p className="mt-1 text-slate-400">
            Create your first workspace to start organising projects with your team.
          </p>
          <Button className="mt-6" onClick={openCreateWorkspace}>
            + Create your first workspace
          </Button>
        </div>
      )}

      {/* Workspace cards */}
      {workspaces && workspaces.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {workspaces.map((workspace) => (
            <Link
              key={workspace.id}
              to={`/workspaces/${workspace.id}`}
              className="group rounded-2xl border border-slate-800 bg-slate-900 p-5 transition hover:-translate-y-0.5 hover:border-indigo-500/50"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-lg font-bold">
                  {workspace.name[0].toUpperCase()}
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${roleStyles[workspace.myRole]}`}
                >
                  {workspace.myRole}
                </span>
              </div>

              <h3 className="mt-4 truncate text-lg font-semibold group-hover:text-indigo-300">
                {workspace.name}
              </h3>

              <p className="mt-1 text-sm text-slate-400">
                {workspace._count.members} {workspace._count.members === 1 ? "member" : "members"} ·{" "}
                {workspace._count.projects}{" "}
                {workspace._count.projects === 1 ? "project" : "projects"}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}