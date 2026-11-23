import { Navigate, Outlet } from "react-router";
import { useAuth } from "../hooks/useAuth";
import LoadingScreen from "../components/ui/LoadingScreen";

// Logged-in users don't need login/register; send them to the dashboard
export default function PublicRoute() {
  const { user, isLoading } = useAuth();

  if (isLoading) return <LoadingScreen />;
  return user ? <Navigate to="/dashboard" replace /> : <Outlet />;
}