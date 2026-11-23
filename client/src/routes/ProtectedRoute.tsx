import { Navigate, Outlet } from "react-router";
import { useAuth } from "../hooks/useAuth";
import LoadingScreen from "../components/ui/LoadingScreen";

// Only logged-in users get through; others go to /login
export default function ProtectedRoute() {
  const { user, isLoading } = useAuth();

  if (isLoading) return <LoadingScreen />;
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}