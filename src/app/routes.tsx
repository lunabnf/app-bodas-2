import { createBrowserRouter } from "react-router-dom";
import AppLayout from "../layouts/AppLayout";

// Páginas
import Home from "../pages/Home";
import Login from "../pages/Login";
import Agenda from "../pages/Agenda";
import Invitados from "../pages/Invitados";
import Checklist from "../pages/Checklist";
import Musica from "../pages/Musica";
import Alojamientos from "../pages/Alojamientos";
import Desplazamientos from "../pages/Desplazamientos";
import NotFound from "../pages/NotFound";

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
      { path: "/alojamientos", element: <Alojamientos /> },
      { path: "/desplazamientos", element: <Desplazamientos /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);