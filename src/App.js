import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from "react";
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
import AgendaAdmin from "./admin/Agenda";
import ArchivosAdmin from "./admin/Archivos";
import AjustesAdmin from "./admin/Ajustes";
function ProtectedRoute({ children }) {
    const user = useAuth((s) => s.user);
    if (!user)
        return _jsx(Navigate, { to: "/login", replace: true });
    return children;
}
function Root() {
    const init = useAuth((s) => s.init);
    useEffect(() => { void init(); }, [init]);
    return (_jsxs(Routes, { children: [_jsxs(Route, { element: _jsx(AppLayout, {}), children: [_jsx(Route, { path: "/", element: _jsx(Home, {}) }), _jsx(Route, { path: "/galeria", element: _jsx("div", { children: "Galer\u00EDa" }) }), _jsx(Route, { path: "/contacto", element: _jsx("div", { children: "Contacto" }) }), _jsx(Route, { path: "/programa", element: _jsx(Programa, {}) }), _jsx(Route, { path: "/confirmar-asistencia", element: _jsx(ConfirmarAsistencia, {}) }), _jsx(Route, { path: "/info/desplazamientos", element: _jsx(Desplazamientos, {}) }), _jsx(Route, { path: "/info/alojamientos", element: _jsx(Alojamientos, {}) }), _jsx(Route, { path: "/participa/confirmar-asistencia", element: _jsx(ConfirmarAsistencia, {}) }), _jsx(Route, { path: "/participa/mesas", element: _jsx(Mesas, {}) }), _jsx(Route, { path: "/participa/asientos-ceremonia", element: _jsx(AsientosCeremonia, {}) }), _jsx(Route, { path: "/countdown", element: _jsx(CountdownPage, {}) })] }), _jsx(Route, { path: "/login", element: _jsx(Login, {}) }), _jsx(Route, { path: "/admin", element: _jsx(ProtectedRoute, { children: _jsx(Admin, {}) }) }), _jsxs(Route, { path: "/admin", element: _jsx(AdminLayout, {}), children: [_jsx(Route, { path: "resumen", element: _jsx(Resumen, {}) }), _jsx(Route, { path: "invitados", element: _jsx(InvitadosAdmin, {}) }), _jsx(Route, { path: "mesas", element: _jsx(MesasAdmin, {}) }), _jsx(Route, { path: "ceremonia", element: _jsx(CeremoniaAdmin, {}) }), _jsx(Route, { path: "presupuesto", element: _jsx(PresupuestoAdmin, {}) }), _jsx(Route, { path: "checklist", element: _jsx(ChecklistAdmin, {}) }), _jsx(Route, { path: "agenda", element: _jsx(AgendaAdmin, {}) }), _jsx(Route, { path: "archivos", element: _jsx(ArchivosAdmin, {}) }), _jsx(Route, { path: "ajustes", element: _jsx(AjustesAdmin, {}) })] }), _jsx(Route, { path: "*", element: _jsx(NotFound, {}) })] }));
}
export default function App() {
    return (_jsx(BrowserRouter, { children: _jsx(Root, {}) }));
}
