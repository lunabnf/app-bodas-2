import { useState } from "react";

interface Invitado {
  id: number;
  nombre: string;
  tipo: string;
  grupo: string;
  estado: "confirmado" | "pendiente" | "rechazado";
  mesa?: string;
}

export default function Invitados() {
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState("todos");
  const [invitados, setInvitados] = useState<Invitado[]>([
    { id: 1, nombre: "Ana Pérez", tipo: "Adulto", grupo: "Familia novia", estado: "confirmado", mesa: "Mesa 3" },
    { id: 2, nombre: "Carlos Ruiz", tipo: "Adulto", grupo: "Amigos novio", estado: "pendiente" },
    { id: 3, nombre: "Lucía Gómez", tipo: "Niño", grupo: "Familia novio", estado: "rechazado" },
  ]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [nuevoInvitado, setNuevoInvitado] = useState<Invitado>({
    id: 0,
    nombre: "",
    tipo: "Adulto",
    grupo: "",
    estado: "confirmado",
    mesa: "",
  });

  const invitadosFiltrados = invitados.filter(
    (i) =>
      (filtro === "todos" || i.estado === filtro) &&
      i.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const abrirModal = () => {
    setNuevoInvitado({
      id: 0,
      nombre: "",
      tipo: "Adulto",
      grupo: "",
      estado: "confirmado",
      mesa: "",
    });
    setMostrarModal(true);
  };

  const guardarInvitado = () => {
    if (nuevoInvitado.nombre.trim() === "" || nuevoInvitado.grupo.trim() === "") {
      // Podrías añadir validación y mostrar mensaje, pero no se pidió.
      return;
    }
    const nuevoId = invitados.length > 0 ? Math.max(...invitados.map(i => i.id)) + 1 : 1;
    const invitadoAGuardar: Invitado = {
      id: nuevoId,
      nombre: nuevoInvitado.nombre.trim(),
      tipo: nuevoInvitado.tipo,
      grupo: nuevoInvitado.grupo.trim(),
      estado: nuevoInvitado.estado,
      mesa: nuevoInvitado.mesa?.trim() || undefined,
    };
    setInvitados([...invitados, invitadoAGuardar]);
    setMostrarModal(false);
  };

  return (
    <div className="min-h-screen bg-black/40 text-white p-6 backdrop-blur-md">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-pink-400">Gestión de invitados</h1>
        <button onClick={abrirModal} className="bg-pink-500 hover:bg-pink-400 text-white px-4 py-2 rounded-md transition">
          + Añadir invitado
        </button>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white/10 p-4 rounded-lg border border-white/10 text-center">
          <p className="text-lg font-semibold text-green-400">Confirmados</p>
          <p className="text-2xl font-bold">{invitados.filter(i => i.estado === "confirmado").length}</p>
        </div>
        <div className="bg-white/10 p-4 rounded-lg border border-white/10 text-center">
          <p className="text-lg font-semibold text-yellow-400">Pendientes</p>
          <p className="text-2xl font-bold">{invitados.filter(i => i.estado === "pendiente").length}</p>
        </div>
        <div className="bg-white/10 p-4 rounded-lg border border-white/10 text-center">
          <p className="text-lg font-semibold text-red-400">Rechazados</p>
          <p className="text-2xl font-bold">{invitados.filter(i => i.estado === "rechazado").length}</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
        <input
          type="text"
          placeholder="Buscar por nombre..."
          className="w-full sm:w-1/3 bg-white/10 border border-white/20 rounded-md p-2 text-white placeholder-white/50 focus:ring-2 focus:ring-pink-400"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <select
          className="bg-white/10 border border-white/20 rounded-md p-2 text-white focus:ring-2 focus:ring-pink-400"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
        >
          <option value="todos">Todos</option>
          <option value="confirmado">Confirmados</option>
          <option value="pendiente">Pendientes</option>
          <option value="rechazado">Rechazados</option>
        </select>
      </div>

      {/* Tabla de invitados */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/10">
              <th className="p-3 border-b border-white/10">Nombre</th>
              <th className="p-3 border-b border-white/10">Tipo</th>
              <th className="p-3 border-b border-white/10">Grupo</th>
              <th className="p-3 border-b border-white/10">Estado</th>
              <th className="p-3 border-b border-white/10">Mesa</th>
              <th className="p-3 border-b border-white/10">QR</th>
              <th className="p-3 border-b border-white/10">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {invitadosFiltrados.map((inv) => (
              <tr key={inv.id} className="hover:bg-white/5 transition">
                <td className="p-3 border-b border-white/10">{inv.nombre}</td>
                <td className="p-3 border-b border-white/10">{inv.tipo}</td>
                <td className="p-3 border-b border-white/10">{inv.grupo}</td>
                <td className="p-3 border-b border-white/10 capitalize">{inv.estado}</td>
                <td className="p-3 border-b border-white/10">{inv.mesa || "-"}</td>
                <td className="p-3 border-b border-white/10">
                  <button className="bg-pink-400 text-black px-2 py-1 rounded text-sm">Ver QR</button>
                </td>
                <td className="p-3 border-b border-white/10">
                  <button className="bg-blue-500 hover:bg-blue-400 text-white px-2 py-1 rounded text-sm mr-2">
                    Editar
                  </button>
                  <button className="bg-red-500 hover:bg-red-400 text-white px-2 py-1 rounded text-sm">
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Acciones en lote */}
      <div className="mt-8 flex flex-wrap gap-4">
        <button className="bg-green-500 hover:bg-green-400 text-white px-4 py-2 rounded-md transition">
          Exportar lista (CSV)
        </button>
        <button className="bg-pink-500 hover:bg-pink-400 text-white px-4 py-2 rounded-md transition">
          Generar QRs
        </button>
        <button className="bg-yellow-500 hover:bg-yellow-400 text-black px-4 py-2 rounded-md transition">
          Enviar recordatorios
        </button>
      </div>

      {/* Modal */}
      {mostrarModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white bg-opacity-90 backdrop-blur-md rounded-lg p-6 w-full max-w-md text-black">
            <h2 className="text-2xl font-bold mb-4">Añadir nuevo invitado</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                guardarInvitado();
              }}
            >
              <div className="mb-4">
                <label className="block mb-1 font-semibold">Nombre</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  value={nuevoInvitado.nombre}
                  onChange={(e) => setNuevoInvitado({ ...nuevoInvitado, nombre: e.target.value })}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1 font-semibold">Tipo</label>
                <select
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  value={nuevoInvitado.tipo}
                  onChange={(e) => setNuevoInvitado({ ...nuevoInvitado, tipo: e.target.value })}
                >
                  <option value="Adulto">Adulto</option>
                  <option value="Niño">Niño</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block mb-1 font-semibold">Grupo</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  value={nuevoInvitado.grupo}
                  onChange={(e) => setNuevoInvitado({ ...nuevoInvitado, grupo: e.target.value })}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1 font-semibold">Estado</label>
                <select
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  value={nuevoInvitado.estado}
                  onChange={(e) =>
                    setNuevoInvitado({
                      ...nuevoInvitado,
                      estado: e.target.value as "confirmado" | "pendiente" | "rechazado",
                    })
                  }
                >
                  <option value="confirmado">Confirmado</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="rechazado">Rechazado</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block mb-1 font-semibold">Mesa (opcional)</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  value={nuevoInvitado.mesa || ""}
                  onChange={(e) => setNuevoInvitado({ ...nuevoInvitado, mesa: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setMostrarModal(false)}
                  className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-pink-500 hover:bg-pink-400 text-white"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}