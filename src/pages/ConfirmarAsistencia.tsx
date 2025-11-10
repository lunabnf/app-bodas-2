import { useState } from "react";

export default function ConfirmarAsistencia() {
  const [form, setForm] = useState({ nombre: "", asistencia: "", mensaje: "" });
  const [enviado, setEnviado] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEnviado(true);
    setTimeout(() => setEnviado(false), 3000);
  };

  return (
    <section className="min-h-screen flex flex-col items-center justify-center text-white bg-black/50 backdrop-blur-md px-6">
      <h1 className="text-4xl font-bold text-pink-300 mb-6">💌 Confirmar asistencia</h1>
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white/10 p-6 rounded-lg shadow-lg border border-white/10 space-y-4"
      >
        <div>
          <label htmlFor="nombre" className="block text-sm text-white/70 mb-1">
            Nombre y apellidos
          </label>
          <input
            id="nombre"
            name="nombre"
            type="text"
            value={form.nombre}
            onChange={handleChange}
            required
            className="w-full rounded-md bg-black/30 border border-white/20 p-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-pink-400"
            placeholder="Escribe tu nombre"
          />
        </div>

        <div>
          <span className="block text-sm text-white/70 mb-1">¿Asistirás a la boda?</span>
          <div className="flex gap-4">
            <label>
              <input
                type="radio"
                name="asistencia"
                value="sí"
                checked={form.asistencia === "sí"}
                onChange={handleChange}
                required
              />{" "}
              Sí
            </label>
            <label>
              <input
                type="radio"
                name="asistencia"
                value="no"
                checked={form.asistencia === "no"}
                onChange={handleChange}
                required
              />{" "}
              No
            </label>
          </div>
        </div>

        <div>
          <label htmlFor="mensaje" className="block text-sm text-white/70 mb-1">
            Mensaje o comentario
          </label>
          <textarea
            id="mensaje"
            name="mensaje"
            value={form.mensaje}
            onChange={handleChange}
            rows={3}
            className="w-full rounded-md bg-black/30 border border-white/20 p-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-pink-400"
            placeholder="¿Quieres dejar algún mensaje?"
          />
        </div>

        <button
          type="submit"
          className="w-full py-2 rounded-md bg-pink-500 hover:bg-pink-400 font-semibold transition"
        >
          Enviar confirmación
        </button>

        {enviado && (
          <p className="text-center text-sm text-green-400 mt-2">
            ¡Gracias! Tu confirmación ha sido registrada.
          </p>
        )}
      </form>
    </section>
  );
}