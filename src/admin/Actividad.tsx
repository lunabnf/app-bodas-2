import { useEffect, useState } from "react";

type Log = {
  id: string;
  user: string;
  action: string;
  timestamp: number;
};

export default function ActividadAdmin() {
  const [logs, setLogs] = useState<Log[]>([]);

  useEffect(() => {
    const raw = localStorage.getItem("wedding.activity");
    if (raw) {
      try {
        setLogs(JSON.parse(raw));
      } catch {
        setLogs([]);
      }
    }
  }, []);

  const formatearFecha = (ts: number) =>
    new Date(ts).toLocaleString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="text-white p-6 space-y-6">
      <h1 className="text-3xl font-bold">Actividad</h1>

      {logs.length === 0 && (
        <p className="opacity-70">Todavía no hay actividad registrada.</p>
      )}

      <div className="space-y-3">
        {logs
          .sort((a, b) => b.timestamp - a.timestamp)
          .map((log) => (
            <div
              key={log.id}
              className="p-4 bg-white/10 border border-white/20 rounded-lg"
            >
              <p className="text-lg font-semibold">{log.user}</p>
              <p className="opacity-90">{log.action}</p>
              <p className="opacity-60 text-sm mt-1">
                {formatearFecha(log.timestamp)}
              </p>
            </div>
          ))}
      </div>
    </div>
  );
}
