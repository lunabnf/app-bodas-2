import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
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

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
