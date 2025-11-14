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

import Admin from "../admin/Admin";
import Presupuesto from "../admin/Presupuesto";
import Mesas from "../admin/Mesas";
import Ceremonia from "../admin/Ceremonia";
import ProgramaAdmin from "../admin/ProgramaAdmin";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/login", element: <Login /> },
      { path: "/agenda", element: <Agenda /> },
      { path: "/invitados", element: <Invitados /> },
      { path: "/checklist", element: <Checklist /> },
      { path: "/musica", element: <Musica /> },
      { path: "/confirmar-asistencia", element: <ConfirmarAsistencia /> },
      { path: "/alojamientos", element: <Alojamientos /> },
      { path: "/desplazamientos", element: <Desplazamientos /> },
      { path: "*", element: <NotFound /> },
    ],
  },
  {
    path: "/admin",
    element: <Admin />,
    children: [
      { path: "presupuesto", element: <Presupuesto /> },
      { path: "mesas", element: <Mesas /> },
      { path: "ceremonia", element: <Ceremonia /> },
      { path: "programa", element: <ProgramaAdmin /> },
    ],
  },
]);