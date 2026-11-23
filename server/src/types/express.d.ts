declare global {
  namespace Express {
    interface Request {
      user?: { id: string };
      membership?: {
        workspaceId: string;
        role: "ADMIN" | "MEMBER" | "VIEWER";
      };
    }
  }
}

export {};