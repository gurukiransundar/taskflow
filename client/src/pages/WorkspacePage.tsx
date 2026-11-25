import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { useAuth } from "../hooks/useAuth";
import { useDeleteWorkspace, useWorkspace } from "../hooks/useWorkspaces";
import { useDeleteProject, useProjects } from "../hooks/useProjects";
import { getErrorMessage } from "../utils/getErrorMessage";
import Button from "../components/ui/Button";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import CreateProjectModal from "../components/projects/CreateProjectModal";
import type { Project, Role } from "../types";

const roleStyles: Record<Role, string> = {
  ADMIN: "bg-indigo-500/15 text-indigo-300",
  MEMBER: "bg-emerald-500/15 text-emerald-300",
  VIEWER: "bg-slate-500/20 text-slate-300",
};

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

export default function WorkspacePage() {
  const { workspaceId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDeleteWorkspaceOpen, setIsDeleteWorkspaceOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [deleteError, setDeleteError] = useState("");

  const workspaceQuery = useWorkspace(workspaceId);
  const projectsQuery = useProjects(workspaceId);
  const deleteWorkspace = useDeleteWorkspace();
  const deleteProject = useDeleteProject(workspaceId ?? "");

  if (workspaceQuery.isLoading) {
    return (
      <div className="mx-auto max-w-6xl space-y-4 px-4 py-8 md:px-8">
        <div className="h-8 w-64 animate-pulse rounded bg-slate-900" />
        <div className="h-4 w-40 animate-pulse rounded bg-slate-900" />
      </div>
    );
  }

  if (workspaceQuery.isError || !workspaceQuery.data) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <div className="text-4xl">🔍</div>
        <h1 className="mt-4 text-xl font-semibold">Workspace not found</h1>
        <p className="mt-1 text-slate-400">It may have been deleted, or you're not a member.</p>
        <Link to="/dashboard" className="mt-6 inline-block text-indigo-400 hover:text-indigo-300">
          ← Back to dashboard
        </Link>
      </div>
    );
  }

  const { workspace, myRole } = workspaceQuery.data;
  const isOwner = workspace.ownerId === user?.id;
  const isAdmin = myRole === "ADMIN";
  const canCreateProject = myRole !== "VIEWER";
  const projects = projectsQuery.data;
  const visibleMembers = workspace.members.slice(0, 5);
  const extraMembers = workspace.members.length - visibleMembers.length;

  function closeDeleteDialogs() {
    setIsDeleteWorkspaceOpen(false);
    setProjectToDelete(null);
    setDeleteError("");
  }

  async function handleDeleteWorkspace() {
    setDeleteError("");
    try {
      await deleteWorkspace.mutateAsync(workspace.id);
      navigate("/dashboard");
    } catch (err) {
      setDeleteError(getErrorMessage(err));
    }
  }

  async function handleDeleteProject() {
    if (!projectToDelete) return;
    setDeleteError("");
    try {
      await deleteProject.mutateAsync(projectToDelete.id);
      closeDeleteDialogs();
    } catch (err) {
      setDeleteError(getErrorMessage(err));
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-8">
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link to="/dashboard" className="text-sm text-slate-400 hover:text-white">
            ← All workspaces
          </Link>
          <div className="mt-2 flex items-center gap-3">
            <h1 className="text-2xl font-bold md:text-3xl">{workspace.name}</h1>
            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${roleStyles[myRole]}`}>
              {myRole}
            </span>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <div className="flex -space-x-2">
              {visibleMembers.map((member) => (
                <div
                  key={member.id}
                  title={`${member.user.name} (${member.role})`}
                  className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-slate-950 bg-slate-800 text-xs font-semibold text-indigo-300"
                >
                  {getInitials(member.user.name)}
                </div>
              ))}
              {extraMembers > 0 && (
                <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-slate-950 bg-slate-700 text-xs font-semibold">
                  +{extraMembers}
                </div>
              )}
            </div>
            <span className="text-sm text-slate-400">
              {workspace.members.length} {workspace.members.length === 1 ? "member" : "members"}
            </span>
          </div>
        </div>

                    <div className="flex flex-wrap gap-2">
          <Link
            to={`/workspaces/${workspace.id}/members`}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2.5 font-semibold text-slate-200 transition hover:bg-slate-800"
          >
            👥 Members
          </Link>
          {canCreateProject && (
            <Button onClick={() => setIsCreateOpen(true)}>+ New project</Button>
          )}
          {isOwner && (
            <Button variant="secondary" onClick={() => setIsDeleteWorkspaceOpen(true)}>
              Delete workspace
            </Button>
          )}
        </div>
      </div>

      <h2 className="mb-4 text-lg font-semibold">Projects</h2>

      {projectsQuery.isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-32 animate-pulse rounded-2xl bg-slate-900" />
          ))}
        </div>
      )}

      {projects?.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-700 p-12 text-center">
          <div className="text-4xl">📋</div>
          <h3 className="mt-4 text-lg font-semibold">No projects yet</h3>
          <p className="mt-1 text-slate-400">
            {canCreateProject
              ? "Create a project to start adding tasks."
              : "An admin or member can create the first project."}
          </p>
          {canCreateProject && (
            <Button className="mt-6" onClick={() => setIsCreateOpen(true)}>
              + Create first project
            </Button>
          )}
        </div>
      )}

      {projects && projects.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <div key={project.id} className="group relative">
              <Link
                to={`/workspaces/${workspace.id}/projects/${project.id}`}
                className="flex h-full flex-col rounded-2xl border border-slate-800 bg-slate-900 p-5 transition hover:-translate-y-0.5 hover:border-indigo-500/50"
              >
                <h3 className="truncate pr-8 text-lg font-semibold group-hover:text-indigo-300">
                  {project.name}
                </h3>
                <p className="mt-1 line-clamp-2 flex-1 text-sm text-slate-400">
                  {project.description || "No description"}
                </p>
                <p className="mt-4 text-xs text-slate-500">
                  {project._count?.tasks ?? 0} {project._count?.tasks === 1 ? "task" : "tasks"}
                </p>
              </Link>

              {/* Delete button: ADMIN only, sits on top of the card (not inside the link) */}
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => setProjectToDelete(project)}
                  aria-label={`Delete ${project.name}`}
                  className="absolute top-4 right-4 rounded-lg p-1.5 text-slate-500 opacity-0 transition group-hover:opacity-100 hover:bg-red-500/10 hover:text-red-400 focus:opacity-100"
                >
                  🗑️
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <CreateProjectModal
        workspaceId={workspace.id}
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />

      <ConfirmDialog
        isOpen={isDeleteWorkspaceOpen}
        onClose={closeDeleteDialogs}
        onConfirm={handleDeleteWorkspace}
        title="Delete workspace?"
        message={`"${workspace.name}" and ALL its projects, tasks and comments will be permanently deleted. This can't be undone.`}
        confirmLabel="Delete workspace"
        isLoading={deleteWorkspace.isPending}
        error={deleteError}
      />

      <ConfirmDialog
        isOpen={projectToDelete !== null}
        onClose={closeDeleteDialogs}
        onConfirm={handleDeleteProject}
        title="Delete project?"
        message={`"${projectToDelete?.name}" and all its tasks and comments will be permanently deleted. This can't be undone.`}
        confirmLabel="Delete project"
        isLoading={deleteProject.isPending}
        error={deleteError}
      />
    </div>
  );
}