import { useState, type FormEvent } from "react";
import Modal from "../ui/Modal";
import Input from "../ui/Input";
import Button from "../ui/Button";
import { useCreateProject } from "../../hooks/useProjects";
import { getErrorMessage } from "../../utils/getErrorMessage";

interface CreateProjectModalProps {
  workspaceId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateProjectModal({
  workspaceId,
  isOpen,
  onClose,
}: CreateProjectModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const createProject = useCreateProject(workspaceId);

  function handleClose() {
    setName("");
    setDescription("");
    setError("");
    onClose();
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    try {
      await createProject.mutateAsync({
        name: name.trim(),
        description: description.trim() || undefined,
      });
      handleClose();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="New project">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {error}
          </div>
        )}

        <Input
          id="project-name"
          label="Project name"
          placeholder="e.g. Website Redesign"
          required
          minLength={2}
          maxLength={100}
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <div className="space-y-1.5">
          <label htmlFor="project-description" className="block text-sm font-medium text-slate-300">
            Description <span className="text-slate-500">(optional)</span>
          </label>
          <textarea
            id="project-description"
            rows={3}
            maxLength={500}
            placeholder="What is this project about?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full resize-none rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-white placeholder-slate-500 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/40"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={createProject.isPending}>
            Create project
          </Button>
        </div>
      </form>
    </Modal>
  );
}