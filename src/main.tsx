import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { getElementById } from "./lib/browser";
import { runSupabaseHealthCheckOnce } from "./services/supabaseHealthCheck";

void runSupabaseHealthCheckOnce().then((result) => {
  if (!result) {
    return;
  }

  if (result.ok) {
    console.log("[Supabase health] OK:", result.details);
    return;
  }

  console.warn("[Supabase health] FAIL:", result.details);
});

const root = getElementById("root");
if (!root) {
  throw new Error("No se encontró el elemento root de la aplicación.");
}

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
