import { jsx as _jsx } from "react/jsx-runtime";
// src/App.tsx
import { RouterProvider } from "react-router-dom";
import { router } from "./app/routes";
export default function App() {
    return _jsx(RouterProvider, { router: router });
}
