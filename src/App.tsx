import { useEffect, type ReactElement } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import AppLayout from "./layouts/AppLayout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import Programa from "./pages/Programa";
import RSVP from "./pages/RSVP";
import Desplazamientos from "./pages/Desplazamientos";
import Alojamientos from "./pages/Alojamientos";
import Mesas from "./pages/Mesas";
import CountdownPage from "./pages/Countdown";
import { useAuth } from "./store/useAuth";

function ProtectedRoute({ children }: { children: ReactElement }) {
  const user = useAuth((s) => s.user);
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function Root() {
  const init = useAuth((s) => s.init);
  useEffect(() => { void init(); }, [init]);

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/galeria" element={<div>Galería</div>} />
        <Route path="/contacto" element={<div>Contacto</div>} />

        <Route path="/programa" element={<Programa />} />
        <Route path="/rsvp" element={<RSVP />} />
        <Route path="/info/desplazamientos" element={<Desplazamientos />} />
        <Route path="/info/alojamientos" element={<Alojamientos />} />
        <Route path="/mesas" element={<Mesas />} />
        <Route path="/countdown" element={<CountdownPage />} />
      </Route>

      <Route path="/login" element={<Login />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <Admin />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Root />
    </BrowserRouter>
  );
}