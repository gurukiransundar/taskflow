import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { useAuth } from "../hooks/useAuth";
import { useWorkspace } from "../hooks/useWorkspaces";
import { useRemoveMember, useUpdateMemberRole } from "../hooks/useMembers";
import { getErrorMessage } from "../utils/getErrorMessage";
import Button from "../components/ui/Button";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import AddMemberModal from "../components/members/AddMemberModal";
import type { Role, WorkspaceMember } from "../types";

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

export default function MembersPage() {
  const { workspaceId = "" } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<WorkspaceMember | null>(null);
  const [error, setError] = useState("");

  const workspaceQuery = useWorkspace(workspaceId);
  const updateRole = useUpdateMemberRole(workspaceId);
  const removeMember = useRemoveMember(workspaceId);

  if (workspaceQuery.isLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-3 px-4 py-8 md:px-8">
        {[1, 2, 3].map((n) => (
          <div key={n} className="h-16 animate-pulse rounded-xl bg-slate-900" />
        ))}
      </div>
    );
  }

  if (workspaceQuery.isError || !workspaceQuery.data) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="text-xl font-semibold">Workspace not found</h1>
        <Link to="/dashboard" className="mt-4 inline-block text-indigo-400 hover:text-indigo-300">
          ← Back to dashboard
        </Link>
      </div>
    );
  }

  const { workspace, myRole } = workspaceQuery.data;
  const isAdmin = myRole === "ADMIN";

  async function handleRoleChange(member: WorkspaceMember, role: Role) {
    setError("");
    try {
      await updateRole.mutateAsync({ memberId: member.id, role });
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function handleRemove() {
    if (!memberToRemove) return;
    setError("");
    try {
      await removeMember.mutateAsync(memberToRemove.id);
      const removedYourself = memberToRemove.userId === user?.id;
      setMemberToRemove(null);
      if (removedYourself) navigate("/dashboard");
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:px-8">
      <Link to={`/workspaces/${workspace.id}`} className="text-sm text-slate-400 hover:text-white">
        ← {workspace.name}
      </Link>

      <div className="mt-2 mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold md:text-3xl">
          Members <span className="text-slate-500">({workspace.members.length})</span>
        </h1>
        {isAdmin && <Button onClick={() => setIsAddOpen(true)}>+ Add member</Button>}
      </div>

      {!isAdmin && (
        <p className="mb-4 text-sm text-slate-400">Only admins can add, change or remove members.</p>
      )}

      {error && (
        <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </div>
      )}

      <ul className="divide-y divide-slate-800 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
        {workspace.members.map((member) => {
          const isOwner = member.userId === workspace.ownerId;
          const isYou = member.userId === user?.id;
          const canEdit = isAdmin && !isOwner;
          const isUpdatingThis =
            updateRole.isPending && updateRole.variables?.memberId === member.id;

          return (
            <li
              key={member.id}
              className="flex flex-wrap items-center gap-4 px-4 py-3 sm:flex-nowrap"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-800 text-sm font-semibold text-indigo-300">
                {getInitials(member.user.name)}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">
                  {member.user.name}
                  {isYou && <span className="ml-2 text-xs text-slate-500">(you)</span>}
                </p>
                <p className="truncate text-sm text-slate-400">{member.user.email}</p>
              </div>

              {canEdit ? (
                <select
                  value={member.role}
                  disabled={isUpdatingThis}
                  onChange={(e) => handleRoleChange(member, e.target.value as Role)}
                  aria-label={`Role for ${member.user.name}`}
                  className="rounded-lg border border-slate-700 bg-slate-800 px-2 py-1.5 text-sm text-white outline-none focus:border-indigo-500 disabled:opacity-50"
                >
                  <option value="ADMIN">Admin</option>
                  <option value="MEMBER">Member</option>
                  <option value="VIEWER">Viewer</option>
                </select>
              ) : (
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${roleStyles[member.role]}`}
                >
                  {member.role}
                  {isOwner && " · Owner"}
                </span>
              )}

              {canEdit ? (
                <button
                  type="button"
                  onClick={() => setMemberToRemove(member)}
                  aria-label={`Remove ${member.user.name}`}
                  className="rounded-lg p-1.5 text-slate-500 transition hover:bg-red-500/10 hover:text-red-400"
                >
                  🗑️
                </button>
              ) : (
                isAdmin && <span className="w-8" />
              )}
            </li>
          );
        })}
      </ul>

      <AddMemberModal
        workspaceId={workspace.id}
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
      />

      <ConfirmDialog
        isOpen={memberToRemove !== null}
        onClose={() => setMemberToRemove(null)}
        onConfirm={handleRemove}
        title="Remove member?"
        message={
          memberToRemove?.userId === user?.id
            ? `You'll lose access to "${workspace.name}".`
            : `${memberToRemove?.user.name} will lose access to "${workspace.name}".`
        }
        confirmLabel="Remove"
        isLoading={removeMember.isPending}
      />
    </div>
  );
}