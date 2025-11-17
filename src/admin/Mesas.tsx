import { useEffect, useState } from "react";
import { addLog } from "../services/logsService";
import { getUsuarioActual } from "../services/userService";

type Invitado = {
  id: string;
  nombre: string;
  mesa?: string;
};

type Mesa = {
  id: string;
  nombre: string;
};

export default function MesasAdmin() {
  const [invitados, setInvitados] = useState<Invitado[]>([]);
  const [mesas, setMesas] = useState<Mesa[]>([]);

  // Cargar datos demo o desde localStorage
  useEffect(() => {
    const storedInvitados = localStorage.getItem("wedding.guests");
    const storedMesas = localStorage.getItem("wedding.tables");

    if (storedInvitados && storedMesas) {
      setInvitados(JSON.parse(storedInvitados));
      setMesas(JSON.parse(storedMesas));
    } else {
      // Datos de ejemplo para la demo
      const demoMesas = [
        { id: "1", nombre: "Mesa 1" },
        { id: "2", nombre: "Mesa 2" },
        { id: "3", nombre: "Mesa 3" },
      ];
      const demoInvitados = [
        { id: "a", nombre: "Luis Luna", mesa: "1" },
        { id: "b", nombre: "Tatiana", mesa: "1" },
        { id: "c", nombre: "Daniel Castañenas", mesa: "2" },
      ];
      setMesas(demoMesas);
      setInvitados(demoInvitados);
      localStorage.setItem("wedding.tables", JSON.stringify(demoMesas));
      localStorage.setItem("wedding.guests", JSON.stringify(demoInvitados));
    }
  }, []);

  const asignarMesa = (id: string, mesaId: string) => {
    const actualizados = invitados.map((i) =>
      i.id === id ? { ...i, mesa: mesaId } : i
    );
    setInvitados(actualizados);
    const usuario = getUsuarioActual();
    const invitado = invitados.find((i) => i.id === id);
    const mesa = mesas.find((m) => m.id === mesaId);
    if (usuario && invitado && mesa) {
      addLog(usuario.nombre, `Asignó a ${invitado.nombre} a ${mesa.nombre}`);
    }
    localStorage.setItem("wedding.guests", JSON.stringify(actualizados));
  };

  if (mesas.length === 0) {
    return <p className="text-white p-6">Cargando mesas...</p>;
  }

  return (
    <section className="text-white p-6">
      <h1 className="text-2xl font-bold mb-6">Gestión de Mesas</h1>

      <table className="w-full text-left border border-white/10 rounded-lg overflow-hidden">
        <thead className="bg-white/10">
          <tr>
            <th className="p-2">Invitado</th>
            <th className="p-2">Mesa</th>
          </tr>
        </thead>
        <tbody>
          {invitados.map((inv) => (
            <tr key={inv.id} className="border-t border-white/10">
              <td className="p-2">{inv.nombre}</td>
              <td className="p-2">
                <select
                  value={inv.mesa || ""}
                  onChange={(e) => asignarMesa(inv.id, e.target.value)}
                  className="bg-black/30 border border-white/20 rounded px-2 py-1 text-white"
                >
                  <option value="">Sin asignar</option>
                  {mesas.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nombre}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}