import { lazy, Suspense, type ReactElement, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { useAuth } from "./store/useAuth";
import { applyAppearanceSettings, getAppearanceSettings } from "./services/appearanceService";

const AppLayout = lazy(() => import("./layouts/AppLayout"));
const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Programa = lazy(() => import("./pages/Programa"));
const ConfirmarAsistencia = lazy(() => import("./pages/ConfirmarAsistencia"));
const Desplazamientos = lazy(() => import("./pages/Desplazamientos"));
const Alojamientos = lazy(() => import("./pages/Alojamientos"));
const Mesas = lazy(() => import("./pages/Mesas"));
const AsientosCeremonia = lazy(() => import("./pages/AsientosCeremonia"));
const CountdownPage = lazy(() => import("./pages/Countdown"));
const Musica = lazy(() => import("./pages/Musica"));
const Fotos = lazy(() => import("./pages/Fotos"));
const ChatPage = lazy(() => import("./pages/Chat"));
const IdentificarInvitado = lazy(() => import("./pages/IdentificarInvitado"));

const AdminLayout = lazy(() => import("./admin/AdminLayout"));
const Resumen = lazy(() => import("./admin/Resumen"));
const InvitadosAdmin = lazy(() => import("./admin/Invitados"));
const MesasAdmin = lazy(() => import("./admin/Mesas"));
const CeremoniaAdmin = lazy(() => import("./admin/Ceremonia"));
const PresupuestoAdmin = lazy(() => import("./admin/Presupuesto"));
const ChecklistAdmin = lazy(() => import("./admin/Checklist"));
const ProgramaAdmin = lazy(() => import("./admin/ProgramaAdmin"));
const AgendaAdmin = lazy(() => import("./admin/Agenda"));
const ArchivosAdmin = lazy(() => import("./admin/Archivos"));
const AjustesAdmin = lazy(() => import("./admin/Ajustes"));
const AlojamientoAdmin = lazy(() => import("./admin/AlojamientoAdmin"));
const DesplazamientoAdmin = lazy(() => import("./admin/DesplazamientoAdmin"));
const ActividadAdmin = lazy(() => import("./admin/Actividad"));
const ChatAdmin = lazy(() => import("./admin/ChatAdmin"));

function RouteFallback() {
  return (
    <div className="min-h-screen bg-[var(--app-bg)] px-6 py-10 text-[var(--app-ink)]">
      <div className="app-surface mx-auto max-w-3xl p-8 text-center">
        <p className="app-kicker">Cargando</p>
        <p className="mt-3 text-sm text-[var(--app-muted)]">
          Preparando la siguiente vista...
        </p>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }: { children: ReactElement }) {
  const esAdmin = useAuth((s) => s.esAdmin);
  if (!esAdmin) return <Navigate to="/login" replace />;
  return children;
}

function Root() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/contacto" element={<div>Contacto</div>} />

          <Route path="/programa" element={<Programa />} />
          <Route path="/confirmar-asistencia" element={<ConfirmarAsistencia />} />
          <Route path="/info/desplazamientos" element={<Desplazamientos />} />
          <Route path="/info/alojamientos" element={<Alojamientos />} />
          <Route path="/participa/confirmar-asistencia" element={<ConfirmarAsistencia />} />
          <Route path="/participa/mesas" element={<Mesas />} />
          <Route path="/participa/asientos-ceremonia" element={<AsientosCeremonia />} />
          <Route path="/participa/musica" element={<Musica />} />
          <Route path="/participa/chat" element={<ChatPage />} />
          <Route path="/participa/fotos" element={<Fotos />} />
          <Route path="/countdown" element={<CountdownPage />} />
          <Route path="/rsvp/:token" element={<IdentificarInvitado />} />
        </Route>

        <Route path="/login" element={<Login />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/resumen" replace />} />
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
          <Route path="alojamiento" element={<AlojamientoAdmin />} />
          <Route path="desplazamiento" element={<DesplazamientoAdmin />} />
          <Route path="actividad" element={<ActividadAdmin />} />
          <Route path="chat" element={<ChatAdmin />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  useEffect(() => {
    applyAppearanceSettings(getAppearanceSettings());
  }, []);

  return (
    <BrowserRouter>
      <Root />
    </BrowserRouter>
  );
}
