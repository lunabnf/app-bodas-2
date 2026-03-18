import { lazy, Suspense, type ReactElement, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useParams } from "react-router-dom";

import { useAuth } from "./store/useAuth";
import { applyAppearanceSettings, getAppearanceSettings } from "./services/appearanceService";
import { trackRouteView } from "./services/backofficeAnalyticsService";
import { evaluateGuestPublicAccessByToken } from "./services/invitationWorkflowService";

const AppLayout = lazy(() => import("./layouts/AppLayout"));
const MarketingLayout = lazy(() => import("./layouts/MarketingLayout"));
const MarketingHome = lazy(() => import("./pages/MarketingHome"));
const MarketingDemo = lazy(() => import("./pages/MarketingDemo"));
const MarketingPricing = lazy(() => import("./pages/MarketingPricing"));
const MarketingCreateEvent = lazy(() => import("./pages/MarketingCreateEvent"));
const BuscarBoda = lazy(() => import("./pages/BuscarBoda"));
const WeddingAccess = lazy(() => import("./pages/WeddingAccess"));
const Home = lazy(() => import("./pages/Home"));
const MiResumen = lazy(() => import("./pages/MiResumen"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Programa = lazy(() => import("./pages/Programa"));
const ConfirmarAsistencia = lazy(() => import("./pages/ConfirmarAsistencia"));
const Desplazamientos = lazy(() => import("./pages/Desplazamientos"));
const Alojamientos = lazy(() => import("./pages/Alojamientos"));
const Mesas = lazy(() => import("./pages/Mesas"));
const CountdownPage = lazy(() => import("./pages/Countdown"));
const Musica = lazy(() => import("./pages/Musica"));
const Fotos = lazy(() => import("./pages/Fotos"));
const ChatPage = lazy(() => import("./pages/Chat"));
const IdentificarInvitado = lazy(() => import("./pages/IdentificarInvitado"));

const AdminLayout = lazy(() => import("./admin/AdminLayout"));
const GestionAdmin = lazy(() => import("./admin/Gestion"));
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
const MusicaAdmin = lazy(() => import("./admin/MusicaAdmin"));
const ActividadAdmin = lazy(() => import("./admin/Actividad"));
const ChatAdmin = lazy(() => import("./admin/ChatAdmin"));
const BackofficeLayout = lazy(() => import("./backoffice/BackofficeLayout"));
const BackofficeLogin = lazy(() => import("./backoffice/BackofficeLogin"));
const BackofficeDashboard = lazy(() => import("./backoffice/BackofficeDashboard"));
const BackofficeMarketing = lazy(() => import("./backoffice/BackofficeMarketing"));
const BackofficePricing = lazy(() => import("./backoffice/BackofficePricing"));
const BackofficeWeddings = lazy(() => import("./backoffice/BackofficeWeddings"));
const BackofficeContent = lazy(() => import("./backoffice/BackofficeContent"));
const BackofficeSettings = lazy(() => import("./backoffice/BackofficeSettings"));

// TEMP DEV: abrir panel de boda sin bloquear por roles/auth para revisión visual y de rutas.
const DEV_OPEN_WEDDING_ADMIN = true;

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
  if (DEV_OPEN_WEDDING_ADMIN) return children;
  const esAdmin = useAuth((s) => s.esAdmin);
  const esSuperAdmin = useAuth((s) => s.esSuperAdmin);
  if (!esAdmin && !esSuperAdmin) return <Navigate to="/buscar-boda" replace />;
  return children;
}

function SuperAdminRoute({ children }: { children: ReactElement }) {
  const esSuperAdmin = useAuth((s) => s.esSuperAdmin);
  if (!esSuperAdmin) return <Navigate to="/backoffice/login" replace />;
  return children;
}

function PublicWeddingRoute({ children }: { children: ReactElement }) {
  const { pathname } = useLocation();
  const { slug } = useParams();
  const invitado = useAuth((state) => state.invitado);
  const esAdmin = useAuth((state) => state.esAdmin);
  const esSuperAdmin = useAuth((state) => state.esSuperAdmin);

  if (!invitado || esAdmin || esSuperAdmin) return children;

  const access = evaluateGuestPublicAccessByToken(invitado.token);
  const rsvpPath = `/w/${slug ?? "demo"}/rsvp`;
  const isRsvpRoute = pathname === rsvpPath || pathname.startsWith(`${rsvpPath}/`);

  if ((access.requiresRsvp || !access.allowed) && !isRsvpRoute) {
    return <Navigate to={rsvpPath} replace />;
  }

  return children;
}

function ScrollToTopOnRouteChange() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    trackRouteView(`${pathname}${search}`);
  }, [pathname, search]);

  return null;
}

function Root() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        {/* 1) Landing comercial */}
        <Route element={<MarketingLayout />}>
          <Route path="/" element={<MarketingHome />} />
          <Route path="/demo" element={<MarketingDemo />} />
          <Route path="/pricing" element={<MarketingPricing />} />
          <Route path="/crear-boda" element={<MarketingCreateEvent />} />
        </Route>
        <Route path="/crear-evento" element={<Navigate to="/crear-boda" replace />} />
        <Route path="/buscar-boda" element={<BuscarBoda />} />
        <Route path="/acceso" element={<Navigate to="/buscar-boda" replace />} />
        <Route path="/login" element={<Navigate to="/buscar-boda" replace />} />
        <Route path="/w/:slug/acceso" element={<WeddingAccess />} />

        {/* 2) Zona pública de boda */}
        <Route
          element={
            <PublicWeddingRoute>
              <AppLayout />
            </PublicWeddingRoute>
          }
        >
          <Route path="/w/:slug" element={<Home />} />
          <Route path="/w/:slug/mi-resumen" element={<MiResumen />} />
          <Route path="/w/:slug/programa" element={<Programa />} />
          <Route path="/w/:slug/rsvp" element={<ConfirmarAsistencia />} />
          <Route path="/w/:slug/rsvp/:token" element={<IdentificarInvitado />} />
          <Route path="/w/:slug/alojamientos" element={<Alojamientos />} />
          <Route path="/w/:slug/desplazamientos" element={<Desplazamientos />} />
          <Route path="/w/:slug/mesas" element={<Mesas />} />
          <Route path="/w/:slug/chat" element={<ChatPage />} />
          <Route path="/w/:slug/musica" element={<Musica />} />
          <Route path="/w/:slug/fotos" element={<Fotos />} />
          <Route path="/w/:slug/contacto" element={<div>Contacto</div>} />
          <Route path="/w/:slug/countdown" element={<CountdownPage />} />
          <Route path="/evento/:slug/rsvp/:token" element={<IdentificarInvitado />} />
        </Route>

        {/* 3) Zona admin de boda */}
        <Route
          path="/w/:slug/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<GestionAdmin />} />
          <Route path="invitados" element={<InvitadosAdmin />} />
          <Route path="programa" element={<ProgramaAdmin />} />
          <Route path="alojamientos" element={<AlojamientoAdmin />} />
          <Route path="desplazamientos" element={<DesplazamientoAdmin />} />
          <Route path="mesas" element={<MesasAdmin />} />
          <Route path="chat" element={<ChatAdmin />} />
          <Route path="musica" element={<MusicaAdmin />} />
          <Route path="presupuesto" element={<PresupuestoAdmin />} />
          <Route path="ajustes" element={<AjustesAdmin />} />
          <Route path="gestion" element={<GestionAdmin />} />
          {/* Compat interna panel */}
          <Route path="resumen" element={<Resumen />} />
          <Route path="ceremonia" element={<CeremoniaAdmin />} />
          <Route path="checklist" element={<ChecklistAdmin />} />
          <Route path="agenda" element={<AgendaAdmin />} />
          <Route path="archivos" element={<ArchivosAdmin />} />
          <Route path="actividad" element={<ActividadAdmin />} />
        </Route>

        {/* Compat temporal con rutas antiguas públicas */}
        <Route path="/evento/demo" element={<Navigate to="/w/demo" replace />} />
        <Route path="/evento/demo/programa" element={<Navigate to="/w/demo/programa" replace />} />
        <Route path="/evento/demo/confirmar-asistencia" element={<Navigate to="/w/demo/rsvp" replace />} />
        <Route path="/evento/demo/info/alojamientos" element={<Navigate to="/w/demo/alojamientos" replace />} />
        <Route path="/evento/demo/info/desplazamientos" element={<Navigate to="/w/demo/desplazamientos" replace />} />
        <Route path="/evento/demo/participa/mesas" element={<Navigate to="/w/demo/mesas" replace />} />
        <Route path="/evento/demo/participa/chat" element={<Navigate to="/w/demo/chat" replace />} />
        <Route path="/evento/demo/participa/musica" element={<Navigate to="/w/demo/musica" replace />} />
        <Route path="/evento/demo/participa/fotos" element={<Navigate to="/w/demo/fotos" replace />} />
        <Route path="/evento/demo/rsvp/:token" element={<Navigate to="/w/demo/rsvp/:token" replace />} />
        <Route path="/contacto" element={<Navigate to="/w/demo/contacto" replace />} />
        <Route path="/programa" element={<Navigate to="/w/demo/programa" replace />} />
        <Route path="/confirmar-asistencia" element={<Navigate to="/w/demo/rsvp" replace />} />
        <Route path="/info/desplazamientos" element={<Navigate to="/w/demo/desplazamientos" replace />} />
        <Route path="/info/alojamientos" element={<Navigate to="/w/demo/alojamientos" replace />} />
        <Route path="/participa/confirmar-asistencia" element={<Navigate to="/w/demo/rsvp" replace />} />
        <Route path="/participa/mesas" element={<Navigate to="/w/demo/mesas" replace />} />
        <Route path="/participa/asientos-ceremonia" element={<Navigate to="/w/demo/mesas" replace />} />
        <Route path="/participa/musica" element={<Navigate to="/w/demo/musica" replace />} />
        <Route path="/participa/chat" element={<Navigate to="/w/demo/chat" replace />} />
        <Route path="/participa/fotos" element={<Navigate to="/w/demo/fotos" replace />} />
        <Route path="/countdown" element={<Navigate to="/w/demo/countdown" replace />} />
        <Route path="/rsvp/:token" element={<Navigate to="/w/demo/rsvp/:token" replace />} />
        <Route path="/rsvp/:slug/:token" element={<IdentificarInvitado />} />

        {/* Compat temporal panel antiguo */}
        <Route path="/app/eventos/:eventId" element={<Navigate to="/w/demo/admin" replace />} />
        <Route path="/app/eventos/:eventId/invitados" element={<Navigate to="/w/demo/admin/invitados" replace />} />
        <Route path="/app/eventos/:eventId/programa" element={<Navigate to="/w/demo/admin/programa" replace />} />
        <Route path="/app/eventos/:eventId/alojamientos" element={<Navigate to="/w/demo/admin/alojamientos" replace />} />
        <Route path="/app/eventos/:eventId/desplazamientos" element={<Navigate to="/w/demo/admin/desplazamientos" replace />} />
        <Route path="/app/eventos/:eventId/mesas" element={<Navigate to="/w/demo/admin/mesas" replace />} />
        <Route path="/app/eventos/:eventId/chat" element={<Navigate to="/w/demo/admin/chat" replace />} />
        <Route path="/app/eventos/:eventId/musica" element={<Navigate to="/w/demo/admin/musica" replace />} />
        <Route path="/app/eventos/:eventId/presupuesto" element={<Navigate to="/w/demo/admin/presupuesto" replace />} />
        <Route path="/app/eventos/:eventId/ajustes" element={<Navigate to="/w/demo/admin/ajustes" replace />} />
        <Route
          path="/admin"
          element={<Navigate to="/w/demo/admin" replace />}
        />
        <Route path="/admin/invitados" element={<Navigate to="/w/demo/admin/invitados" replace />} />
        <Route path="/admin/programa" element={<Navigate to="/w/demo/admin/programa" replace />} />
        <Route path="/admin/alojamiento" element={<Navigate to="/w/demo/admin/alojamientos" replace />} />
        <Route path="/admin/desplazamiento" element={<Navigate to="/w/demo/admin/desplazamientos" replace />} />
        <Route path="/admin/mesas" element={<Navigate to="/w/demo/admin/mesas" replace />} />
        <Route path="/admin/chat" element={<Navigate to="/w/demo/admin/chat" replace />} />
        <Route path="/admin/presupuesto" element={<Navigate to="/w/demo/admin/presupuesto" replace />} />
        <Route path="/admin/ajustes" element={<Navigate to="/w/demo/admin/ajustes" replace />} />
        <Route path="/admin/resumen" element={<Navigate to="/w/demo/admin" replace />} />
        <Route
          path="/admin/*"
          element={<Navigate to="/w/demo/admin" replace />}
        />

        <Route path="/backoffice/login" element={<BackofficeLogin />} />
        <Route
          path="/backoffice"
          element={
            <SuperAdminRoute>
              <BackofficeLayout />
            </SuperAdminRoute>
          }
        >
          <Route index element={<BackofficeDashboard />} />
          <Route path="marketing" element={<BackofficeMarketing />} />
          <Route path="pricing" element={<BackofficePricing />} />
          <Route path="weddings" element={<BackofficeWeddings />} />
          <Route path="content" element={<BackofficeContent />} />
          <Route path="settings" element={<BackofficeSettings />} />
        </Route>
        <Route path="/owner" element={<Navigate to="/backoffice" replace />} />
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
      <ScrollToTopOnRouteChange />
      <Root />
    </BrowserRouter>
  );
}
