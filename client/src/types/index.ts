// ---------- Roles ----------
export type Role = "ADMIN" | "MEMBER" | "VIEWER";

// ---------- Users ----------
// Short version of a user, shown next to members, assignees, comments
export interface UserSummary {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
}

// The logged-in user (from /api/auth/me)
export interface User extends UserSummary {
  createdAt: string;
}

// ---------- Workspaces ----------
export interface Workspace {
  id: string;
  name: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

// One item from GET /api/workspaces (the list)
export interface WorkspaceListItem extends Workspace {
  myRole: Role;
  _count: { members: number; projects: number };
}

// A person inside a workspace
export interface WorkspaceMember {
  id: string;
  role: Role;
  userId: string;
  workspaceId: string;
  joinedAt: string;
  user: UserSummary;
}

// From GET /api/workspaces/:workspaceId (one workspace with its members)
export interface WorkspaceDetails extends Workspace {
  members: WorkspaceMember[];
  _count: { projects: number };
}

// ---------- Projects ----------
export interface Project {
  id: string;
  name: string;
  description: string | null;
  workspaceId: string;
  createdAt: string;
  updatedAt: string;
  _count?: { tasks: number }; // only included in lists
}
// ---------- Tasks ----------
export type TaskStatus = "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
export type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: Priority;
  position: number;
  dueDate: string | null;
  projectId: string;
  assigneeId: string | null;
  creatorId: string;
  createdAt: string;
  updatedAt: string;
  assignee: UserSummary | null;
  creator: UserSummary;
  _count: { comments: number };
}

// ---------- Comments ----------
export interface Comment {
  id: string;
  content: string;
  taskId: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  author: UserSummary;
}