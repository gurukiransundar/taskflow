import { Navigate, Route, Routes } from "react-router";
import PublicRoute from "./routes/PublicRoute";
import ProtectedRoute from "./routes/ProtectedRoute";
import AppLayout from "./components/layout/AppLayout";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import WorkspacePage from "./pages/WorkspacePage";
import MembersPage from "./pages/MembersPage";
export default function App() {
  return (
    <Routes>
      {/* Only for logged-out users */}
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Only for logged-in users, inside the Navbar + Sidebar frame */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/workspaces/:workspaceId" element={<WorkspacePage />} />
                    <Route path="/workspaces/:workspaceId/members" element={<MembersPage />} />
        </Route>
      </Route>

      {/* Any other URL → dashboard (which sends you to login if needed) */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}