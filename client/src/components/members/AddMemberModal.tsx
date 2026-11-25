import { useState, type FormEvent } from "react";
import Modal from "../ui/Modal";
import Input from "../ui/Input";
import Button from "../ui/Button";
import { useAddMember } from "../../hooks/useMembers";
import { getErrorMessage } from "../../utils/getErrorMessage";
import type { Role } from "../../types";

interface AddMemberModalProps {
  workspaceId: string;
  isOpen: boolean;
  onClose: () => void;
}

const roleHelp: Record<Role, string> = {
  ADMIN: "Full control: manage members, delete projects",
  MEMBER: "Create and edit projects and tasks",
  VIEWER: "Can only view, no changes",
};

export default function AddMemberModal({ workspaceId, isOpen, onClose }: AddMemberModalProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("MEMBER");
  const [error, setError] = useState("");
  const addMember = useAddMember(workspaceId);

  function handleClose() {
    setEmail("");
    setRole("MEMBER");
    setError("");
    onClose();
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    try {
      await addMember.mutateAsync({ email: email.trim(), role });
      handleClose();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add member">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {error}
          </div>
        )}

        <Input
          id="member-email"
          label="Email"
          type="email"
          placeholder="teammate@example.com"
          required
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div className="space-y-1.5">
          <label htmlFor="member-role" className="block text-sm font-medium text-slate-300">
            Role
          </label>
          <select
            id="member-role"
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-white outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40"
          >
            <option value="MEMBER">Member</option>
            <option value="VIEWER">Viewer</option>
            <option value="ADMIN">Admin</option>
          </select>
          <p className="text-xs text-slate-500">{roleHelp[role]}</p>
        </div>

        <p className="text-xs text-slate-500">
          They must already have a TaskFlow account with this email.
        </p>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={addMember.isPending}>
            Add member
          </Button>
        </div>
      </form>
    </Modal>
  );
}