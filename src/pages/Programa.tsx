type Evento = {
  id: string;
  hora: string;
  titulo: string;
  descripcion: string;
};

export default function Programa() {
  const eventos: Evento[] = JSON.parse(
    localStorage.getItem("wedding.programa") || "[]"
  );

  return (
    <section className="text-white p-6 space-y-4">
      <h1 className="text-2xl font-bold">Programa del día</h1>
      {eventos.length === 0 ? (
        <p>No hay eventos configurados aún.</p>
      ) : (
        <ul className="space-y-3">
          {eventos.map((ev) => (
            <li
              key={ev.id}
              className="bg-white/10 p-4 rounded border border-white/10"
            >
              <p className="font-semibold">{ev.hora} — {ev.titulo}</p>
              <p className="text-sm opacity-80">{ev.descripcion}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}