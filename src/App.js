import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./layouts/AppLayout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Programa from "./pages/Programa";
import ConfirmarAsistencia from "./pages/ConfirmarAsistencia";
import Desplazamientos from "./pages/Desplazamientos";
import Alojamientos from "./pages/Alojamientos";
import Mesas from "./pages/Mesas";
import AsientosCeremonia from "./pages/AsientosCeremonia";
import CountdownPage from "./pages/Countdown";
import Musica from "./pages/Musica";
import Fotos from "./pages/Fotos";
import ChatPage from "./pages/Chat";
import { useAuth } from "./store/useAuth";
import IdentificarInvitado from "./pages/IdentificarInvitado";
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
import AlojamientoAdmin from "./admin/AlojamientoAdmin";
import DesplazamientoAdmin from "./admin/DesplazamientoAdmin";
import ActividadAdmin from "./admin/Actividad";
import ChatAdmin from "./admin/ChatAdmin";
import { applyAppearanceSettings, getAppearanceSettings } from "./services/appearanceService";
function ProtectedRoute({ children }) {
    const esAdmin = useAuth((s) => s.esAdmin);
    if (!esAdmin)
        return _jsx(Navigate, { to: "/login", replace: true });
    return children;
}
function Root() {
    return (_jsxs(Routes, { children: [_jsxs(Route, { element: _jsx(AppLayout, {}), children: [_jsx(Route, { path: "/", element: _jsx(Home, {}) }), _jsx(Route, { path: "/contacto", element: _jsx("div", { children: "Contacto" }) }), _jsx(Route, { path: "/programa", element: _jsx(Programa, {}) }), _jsx(Route, { path: "/confirmar-asistencia", element: _jsx(ConfirmarAsistencia, {}) }), _jsx(Route, { path: "/info/desplazamientos", element: _jsx(Desplazamientos, {}) }), _jsx(Route, { path: "/info/alojamientos", element: _jsx(Alojamientos, {}) }), _jsx(Route, { path: "/participa/confirmar-asistencia", element: _jsx(ConfirmarAsistencia, {}) }), _jsx(Route, { path: "/participa/mesas", element: _jsx(Mesas, {}) }), _jsx(Route, { path: "/participa/asientos-ceremonia", element: _jsx(AsientosCeremonia, {}) }), _jsx(Route, { path: "/participa/musica", element: _jsx(Musica, {}) }), _jsx(Route, { path: "/participa/chat", element: _jsx(ChatPage, {}) }), _jsx(Route, { path: "/participa/fotos", element: _jsx(Fotos, {}) }), _jsx(Route, { path: "/countdown", element: _jsx(CountdownPage, {}) }), _jsx(Route, { path: "/rsvp/:token", element: _jsx(IdentificarInvitado, {}) })] }), _jsx(Route, { path: "/login", element: _jsx(Login, {}) }), _jsxs(Route, { path: "/admin", element: _jsx(ProtectedRoute, { children: _jsx(AdminLayout, {}) }), children: [_jsx(Route, { index: true, element: _jsx(Navigate, { to: "/admin/resumen", replace: true }) }), _jsx(Route, { path: "resumen", element: _jsx(Resumen, {}) }), _jsx(Route, { path: "invitados", element: _jsx(InvitadosAdmin, {}) }), _jsx(Route, { path: "mesas", element: _jsx(MesasAdmin, {}) }), _jsx(Route, { path: "ceremonia", element: _jsx(CeremoniaAdmin, {}) }), _jsx(Route, { path: "presupuesto", element: _jsx(PresupuestoAdmin, {}) }), _jsx(Route, { path: "checklist", element: _jsx(ChecklistAdmin, {}) }), _jsx(Route, { path: "agenda", element: _jsx(AgendaAdmin, {}) }), _jsx(Route, { path: "archivos", element: _jsx(ArchivosAdmin, {}) }), _jsx(Route, { path: "ajustes", element: _jsx(AjustesAdmin, {}) }), _jsx(Route, { path: "programa", element: _jsx(ProgramaAdmin, {}) }), _jsx(Route, { path: "alojamiento", element: _jsx(AlojamientoAdmin, {}) }), _jsx(Route, { path: "desplazamiento", element: _jsx(DesplazamientoAdmin, {}) }), _jsx(Route, { path: "actividad", element: _jsx(ActividadAdmin, {}) }), _jsx(Route, { path: "chat", element: _jsx(ChatAdmin, {}) })] }), _jsx(Route, { path: "*", element: _jsx(NotFound, {}) })] }));
}
export default function App() {
    useEffect(() => {
        applyAppearanceSettings(getAppearanceSettings());
    }, []);
    return (_jsx(BrowserRouter, { children: _jsx(Root, {}) }));
}
