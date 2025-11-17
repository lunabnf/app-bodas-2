import { useState, useEffect } from "react";

export default function Ajustes() {
  const [nombres, setNombres] = useState({ novio1: "", novio2: "" });
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [color, setColor] = useState("#ffffff");
  const [mensajeInvitacion, setMensajeInvitacion] = useState("");
  const [portada, setPortada] = useState<string | null>(null);
  const [mostrarPrograma, setMostrarPrograma] = useState(true);
  const [mostrarMesas, setMostrarMesas] = useState(true);

  useEffect(() => {
    const savedNovio = localStorage.getItem("wedding.novio") || "";
    const savedNovia = localStorage.getItem("wedding.novia") || "";
    setNombres({ novio1: savedNovio, novio2: savedNovia });

    const savedFecha = localStorage.getItem("wedding.fecha");
    if (savedFecha) setFecha(savedFecha);

    const savedHora = localStorage.getItem("wedding.hora");
    if (savedHora) setHora(savedHora);
  }, []);

  const subirPortada = (file: File) => {
    const url = URL.createObjectURL(file);
    setPortada(url);
  };

  return (
    <div className="text-white p-6 max-w-4xl mx-auto space-y-10">

      <h1 className="text-3xl font-bold">Ajustes y Configuración</h1>

      {/* DATOS DE LA BODA */}
      <section className="bg-white/10 p-5 rounded-lg border border-white/20">
        <h2 className="text-2xl font-semibold mb-4">Datos de la boda</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Nombre del novio / novia 1"
            value={nombres.novio1}
            onChange={(e) => {
              const updatedNames = { ...nombres, novio1: e.target.value };
              setNombres(updatedNames);
              localStorage.setItem("wedding.novio", e.target.value);
            }}
            className="p-2 bg-black/30 border border-white/30 rounded"
          />

          <input
            type="text"
            placeholder="Nombre del novio / novia 2"
            value={nombres.novio2}
            onChange={(e) => {
              const updatedNames = { ...nombres, novio2: e.target.value };
              setNombres(updatedNames);
              localStorage.setItem("wedding.novia", e.target.value);
            }}
            className="p-2 bg-black/30 border border-white/30 rounded"
          />

          <input
            type="date"
            value={fecha}
            onChange={(e) => {
              setFecha(e.target.value);
              localStorage.setItem("wedding.fecha", e.target.value);
            }}
            className="p-2 bg-black/30 border border-white/30 rounded"
          />

          <input
            type="time"
            value={hora}
            onChange={(e) => {
              setHora(e.target.value);
              localStorage.setItem("wedding.hora", e.target.value);
            }}
            className="p-2 bg-black/30 border border-white/30 rounded"
          />

          <input
            type="text"
            placeholder="Ubicación / dirección"
            value={ubicacion}
            onChange={(e) => setUbicacion(e.target.value)}
            className="p-2 bg-black/30 border border-white/30 rounded col-span-1 md:col-span-2"
          />

          <div className="flex flex-col col-span-1 md:col-span-2">
            <label className="mb-1 font-semibold">Color principal de la boda</label>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-20 h-10 p-1 rounded"
            />
          </div>
        </div>
      </section>

      {/* PORTADA */}
      <section className="bg-white/10 p-5 rounded-lg border border-white/20">
        <h2 className="text-2xl font-semibold mb-4">Foto de portada</h2>

        <button
          onClick={() =>
            document.getElementById("filePortada")?.click()
          }
          className="bg-blue-600 px-4 py-2 rounded mb-4"
        >
          Subir portada
        </button>

        <input
          id="filePortada"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) subirPortada(e.target.files[0]);
          }}
        />

        {portada && (
          <div className="mt-4">
            <img
              src={portada}
              alt="Portada"
              className="w-full max-h-60 object-cover rounded"
            />
          </div>
        )}
      </section>

      {/* INVITACIONES */}
      <section className="bg-white/10 p-5 rounded-lg border border-white/20">
        <h2 className="text-2xl font-semibold mb-4">Invitaciones</h2>

        <textarea
          placeholder="Mensaje personalizado para las invitaciones"
          value={mensajeInvitacion}
          onChange={(e) => setMensajeInvitacion(e.target.value)}
          className="w-full p-3 bg-black/30 border border-white/20 rounded mb-3"
          rows={4}
        />

        <div className="flex items-center gap-3 mb-3">
          <input
            type="checkbox"
            checked={mostrarPrograma}
            onChange={() => setMostrarPrograma(!mostrarPrograma)}
          />
          <label>Mostrar programa a los invitados</label>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={mostrarMesas}
            onChange={() => setMostrarMesas(!mostrarMesas)}
          />
          <label>Mostrar mesas a los invitados</label>
        </div>
      </section>

      {/* EXPORTAR / RESET */}
      <section className="bg-white/10 p-5 rounded-lg border border-white/20">
        <h2 className="text-2xl font-semibold mb-4">Gestión de datos</h2>

        <div className="flex flex-col md:flex-row gap-3">
          <button className="bg-green-600 px-4 py-2 rounded">
            Exportar datos
          </button>

          <button className="bg-red-600 px-4 py-2 rounded">
            Reiniciar boda (vaciar todo)
          </button>
        </div>
      </section>
    </div>
  );
}