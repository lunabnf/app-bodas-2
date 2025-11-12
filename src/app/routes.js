import { jsx as _jsx } from "react/jsx-runtime";
import { createBrowserRouter } from "react-router-dom";
import AppLayout from "../layouts/AppLayout";
// Páginas
import Home from "../pages/Home";
import Login from "../pages/Login";
import Agenda from "../pages/Agenda";
import Invitados from "../pages/Invitados";
import Checklist from "../pages/Checklist";
import Musica from "../pages/Musica";
import ConfirmarAsistencia from "../pages/ConfirmarAsistencia";
import Alojamientos from "../pages/Alojamientos";
import Desplazamientos from "../pages/Desplazamientos";
import NotFound from "../pages/NotFound";
export const router = createBrowserRouter([
    {
        path: "/",
        element: _jsx(AppLayout, {}),
        children: [
            { path: "/", element: _jsx(Home, {}) },
            { path: "/login", element: _jsx(Login, {}) },
            { path: "/agenda", element: _jsx(Agenda, {}) },
            { path: "/invitados", element: _jsx(Invitados, {}) },
            { path: "/checklist", element: _jsx(Checklist, {}) },
            { path: "/musica", element: _jsx(Musica, {}) },
            { path: "/confirmar-asistencia", element: _jsx(ConfirmarAsistencia, {}) },
            { path: "/alojamientos", element: _jsx(Alojamientos, {}) },
            { path: "/desplazamientos", element: _jsx(Desplazamientos, {}) },
            { path: "*", element: _jsx(NotFound, {}) },
        ],
    },
]);
