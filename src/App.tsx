import { useEffect, type ReactElement } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import AppLayout from "./layouts/AppLayout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import Programa from "./pages/Programa";
import ConfirmarAsistencia from "./pages/ConfirmarAsistencia";
import Desplazamientos from "./pages/Desplazamientos";
import Alojamientos from "./pages/Alojamientos";
import Mesas from "./pages/Mesas";
import AsientosCeremonia from "./pages/AsientosCeremonia";
import CountdownPage from "./pages/Countdown";
import { useAuth } from "./store/useAuth";

import Personalizacion from "./pages/Personalizacion";
import Checklist from "./pages/Checklist";
import Agenda from "./pages/Agenda";
import Invitados from "./pages/Invitados";
import Presupuesto from "./pages/Presupuesto";
import Archivos from "./pages/Archivos";
import Ajustes from "./pages/Ajustes";

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
        <Route path="/confirmar-asistencia" element={<ConfirmarAsistencia />} />
        <Route path="/info/desplazamientos" element={<Desplazamientos />} />
        <Route path="/info/alojamientos" element={<Alojamientos />} />
        <Route path="/participa/mesas" element={<Mesas />} />
        <Route path="/participa/asientos-ceremonia" element={<AsientosCeremonia />} />
        <Route path="/countdown" element={<CountdownPage />} />

        {/* Organización (novios) */}
        <Route path="/organiza/personalizacion" element={<Personalizacion />} />
        <Route path="/organiza/checklist" element={<Checklist />} />
        <Route path="/organiza/agenda" element={<Agenda />} />
        <Route path="/organiza/invitados" element={<Invitados />} />
        <Route path="/organiza/presupuesto" element={<Presupuesto />} />
        <Route path="/organiza/archivos" element={<Archivos />} />
        <Route path="/organiza/ajustes" element={<Ajustes />} />
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