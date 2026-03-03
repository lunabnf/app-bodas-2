import { useEffect, useState } from "react";
import type { Guest } from "../domain/guest";
import type { Table } from "../domain/table";
import { assignGuestToTable, loadGuestsAdminData } from "../application/adminGuestsService";

export default function MesasAdmin() {
  const [invitados, setInvitados] = useState<Guest[]>([]);
  const [mesas, setMesas] = useState<Table[]>([]);

  useEffect(() => {
    void (async () => {
      const { invitados: loadedInvitados, mesas: loadedMesas } =
        await loadGuestsAdminData();
      setInvitados(loadedInvitados);
      setMesas(loadedMesas);
    })();
  }, []);

  const asignarMesa = async (token: string, mesaId: string) => {
    const updated = await assignGuestToTable(invitados, mesas, token, mesaId);
    setInvitados(updated.invitados);
    setMesas(updated.mesas);
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
            <tr key={inv.token} className="border-t border-white/10">
              <td className="p-2">{inv.nombre}</td>
              <td className="p-2">
                <select
                  value={inv.mesa || ""}
                  onChange={(e) => void asignarMesa(inv.token, e.target.value)}
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
