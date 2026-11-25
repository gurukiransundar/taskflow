import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import Modal from "../ui/Modal";
import Input from "../ui/Input";
import Button from "../ui/Button";
import { useCreateWorkspace } from "../../hooks/useWorkspaces";
import { getErrorMessage } from "../../utils/getErrorMessage";

interface CreateWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateWorkspaceModal({ isOpen, onClose }: CreateWorkspaceModalProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const createWorkspace = useCreateWorkspace();
  const navigate = useNavigate();

  // Reset the form whenever the popup closes
  function handleClose() {
    setName("");
    setError("");
    onClose();
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    try {
      const workspace = await createWorkspace.mutateAsync(name.trim());
      handleClose();
      navigate(`/workspaces/${workspace.id}`); // go straight to the new workspace
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="New workspace">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {error}
          </div>
        )}

        <Input
          id="workspace-name"
          label="Workspace name"
          placeholder="e.g. My Startup"
          required
          minLength={2}
          maxLength={50}
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <p className="text-xs text-slate-500">
          You'll be the admin of this workspace. You can invite teammates later.
        </p>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={createWorkspace.isPending}>
            Create workspace
          </Button>
        </div>
      </form>
    </Modal>
  );
}