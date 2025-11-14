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

import AdminLayout from "./admin/AdminLayout";
import Resumen from "./admin/Resumen";
import InvitadosAdmin from "./admin/Invitados";
import MesasAdmin from "./admin/Mesas";
import CeremoniaAdmin from "./admin/Ceremonia";
import PresupuestoAdmin from "./admin/Presupuesto";
import ChecklistAdmin from "./admin/Checklist";
import ProgramaAdmin from "./admin/ProgramaAdmin";
import AgendaAdmin from "./admin/Agenda";
import ArchivosAdmin from "./admin/Archivos";
import AjustesAdmin from "./admin/Ajustes";

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
        <Route path="/participa/confirmar-asistencia" element={<ConfirmarAsistencia />} />
        <Route path="/participa/mesas" element={<Mesas />} />
        <Route path="/participa/asientos-ceremonia" element={<AsientosCeremonia />} />
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
      <Route path="/admin" element={<AdminLayout />}>
        <Route path="resumen" element={<Resumen />} />
        <Route path="invitados" element={<InvitadosAdmin />} />
        <Route path="mesas" element={<MesasAdmin />} />
        <Route path="ceremonia" element={<CeremoniaAdmin />} />
        <Route path="presupuesto" element={<PresupuestoAdmin />} />
        <Route path="checklist" element={<ChecklistAdmin />} />
        <Route path="agenda" element={<AgendaAdmin />} />
        <Route path="archivos" element={<ArchivosAdmin />} />
        <Route path="ajustes" element={<AjustesAdmin />} />
        <Route path="programa" element={<ProgramaAdmin />} />
      </Route>
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