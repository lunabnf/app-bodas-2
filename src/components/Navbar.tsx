import { Link } from "react-router-dom";
import { useAuth } from "@/store/useAuth";

export default function Navbar() {
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);
  return (
    <nav className="flex items-center justify-between p-3">
      <Link to="/" className="font-semibold">App Bodas 2</Link>
      <div className="flex gap-3">
        <Link to="/rsvp">RSVP</Link>
        {user ? (<>
          <Link to="/admin">Admin</Link>
          <button onClick={logout}>Salir</button>
        </>) : <Link to="/login">Entrar</Link>}
      </div>
    </nav>
  );
}