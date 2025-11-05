import { RouteObject } from "react-router-dom";
import Home from "../pages/Home";
import Login from "../pages/Login";
import NotFound from "../pages/NotFound";
import ProtectedRoute from "./ProtectedRoute";
import Admin from "../pages/Admin";

export const routes: RouteObject[] = [
  { path: "/", element: <Home /> },
  { path: "/login", element: <Login /> },
  { path: "/admin", element: <ProtectedRoute><Admin /></ProtectedRoute> },
  { path: "*", element: <NotFound /> },
];