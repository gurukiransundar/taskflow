import { Link, useNavigate } from "react-router";
import { useAuth } from "../../hooks/useAuth";
import Button from "../ui/Button";

interface NavbarProps {
  onMenuClick: () => void;
}

// "Guru Kiran" → "GK"
function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-800 bg-slate-950 px-4 md:px-6">
      <div className="flex items-center gap-3">
        {/* Menu button: only on small screens, opens the sidebar */}
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open menu"
          className="rounded-lg p-2 text-slate-300 hover:bg-slate-800 md:hidden"
        >
          ☰
        </button>

        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 font-bold text-white">
            T
          </div>
          <span className="text-lg font-semibold text-white">TaskFlow</span>
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium text-white">{user?.name}</p>
          <p className="text-xs text-slate-400">{user?.email}</p>
        </div>

        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-sm font-semibold text-indigo-300">
          {user ? getInitials(user.name) : "?"}
        </div>

        <Button variant="ghost" size="sm" onClick={handleLogout}>
          Log out
        </Button>
      </div>
    </header>
  );
}