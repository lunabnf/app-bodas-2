import type { ReactElement } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../store/useAuth";

export default function ProtectedRoute({ children }: { children: ReactElement }) {
  const user = useAuth((s) => s.user);
  if (!user) return <Navigate to="/login" replace />;
  return children;
}