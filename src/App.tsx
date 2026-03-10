import { lazy, Suspense, type ReactElement, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { useAuth } from "./store/useAuth";
import { applyAppearanceSettings, getAppearanceSettings } from "./services/appearanceService";
import { eventSitePaths } from "./eventSite/paths";

const AppLayout = lazy(() => import("./layouts/AppLayout"));
const MarketingLayout = lazy(() => import("./layouts/MarketingLayout"));
const MarketingHome = lazy(() => import("./pages/MarketingHome"));
const MarketingDemo = lazy(() => import("./pages/MarketingDemo"));
const MarketingPricing = lazy(() => import("./pages/MarketingPricing"));
const MarketingCreateEvent = lazy(() => import("./pages/MarketingCreateEvent"));
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
const OwnerLayout = lazy(() => import("./owner/OwnerLayout"));
const OwnerDashboard = lazy(() => import("./owner/OwnerDashboard"));

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
  const esOwner = useAuth((s) => s.esOwner);
  if (!esAdmin && !esOwner) return <Navigate to="/acceso" replace />;
  return children;
}

function OwnerProtectedRoute({ children }: { children: ReactElement }) {
  const esOwner = useAuth((s) => s.esOwner);
  if (!esOwner) return <Navigate to="/acceso" replace />;
  return children;
}

function Root() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route element={<MarketingLayout />}>
          <Route path="/" element={<MarketingHome />} />
          <Route path="/demo" element={<MarketingDemo />} />
          <Route path="/pricing" element={<MarketingPricing />} />
          <Route path="/crear-evento" element={<MarketingCreateEvent />} />
        </Route>

        <Route element={<AppLayout />}>
          <Route path={eventSitePaths.home} element={<Home />} />
          <Route path={eventSitePaths.contacto} element={<div>Contacto</div>} />

          <Route path={eventSitePaths.programa} element={<Programa />} />
          <Route path={eventSitePaths.confirmarAsistencia} element={<ConfirmarAsistencia />} />
          <Route path={eventSitePaths.desplazamientos} element={<Desplazamientos />} />
          <Route path={eventSitePaths.alojamientos} element={<Alojamientos />} />
          <Route path={eventSitePaths.participaConfirmacion} element={<ConfirmarAsistencia />} />
          <Route path={eventSitePaths.participaMesas} element={<Mesas />} />
          <Route path={eventSitePaths.participaAsientos} element={<AsientosCeremonia />} />
          <Route path={eventSitePaths.participaMusica} element={<Musica />} />
          <Route path={eventSitePaths.participaChat} element={<ChatPage />} />
          <Route path={eventSitePaths.participaFotos} element={<Fotos />} />
          <Route path={eventSitePaths.countdown} element={<CountdownPage />} />
          <Route path="/evento/:slug/rsvp/:token" element={<IdentificarInvitado />} />
        </Route>

        <Route path="/contacto" element={<Navigate to={eventSitePaths.contacto} replace />} />
        <Route path="/programa" element={<Navigate to={eventSitePaths.programa} replace />} />
        <Route
          path="/confirmar-asistencia"
          element={<Navigate to={eventSitePaths.confirmarAsistencia} replace />}
        />
        <Route
          path="/info/desplazamientos"
          element={<Navigate to={eventSitePaths.desplazamientos} replace />}
        />
        <Route
          path="/info/alojamientos"
          element={<Navigate to={eventSitePaths.alojamientos} replace />}
        />
        <Route
          path="/participa/confirmar-asistencia"
          element={<Navigate to={eventSitePaths.participaConfirmacion} replace />}
        />
        <Route
          path="/participa/mesas"
          element={<Navigate to={eventSitePaths.participaMesas} replace />}
        />
        <Route
          path="/participa/asientos-ceremonia"
          element={<Navigate to={eventSitePaths.participaAsientos} replace />}
        />
        <Route
          path="/participa/musica"
          element={<Navigate to={eventSitePaths.participaMusica} replace />}
        />
        <Route
          path="/participa/chat"
          element={<Navigate to={eventSitePaths.participaChat} replace />}
        />
        <Route
          path="/participa/fotos"
          element={<Navigate to={eventSitePaths.participaFotos} replace />}
        />
        <Route path="/countdown" element={<Navigate to={eventSitePaths.countdown} replace />} />
        <Route path="/evento/demo/rsvp/:token" element={<IdentificarInvitado />} />
        <Route path="/rsvp/:token" element={<IdentificarInvitado />} />
        <Route path="/rsvp/:slug/:token" element={<IdentificarInvitado />} />

        <Route path="/login" element={<Login />} />
        <Route path="/acceso" element={<Login />} />
        <Route
          path="/owner"
          element={
            <OwnerProtectedRoute>
              <OwnerLayout />
            </OwnerProtectedRoute>
          }
        >
          <Route index element={<OwnerDashboard />} />
        </Route>
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
