import { useState } from "react";

type Gasto = {
  id: string;
  concepto: string;
  proveedor?: string;
  fecha?: string;
  adjunto?: string;
  previsto: number;
  real: number;
  estado: "Pendiente" | "Pagado" | "Confirmado";
  notas?: string;
};

type Categoria = {
  id: string;
  nombre: string;
  gastos: Gasto[];
};

function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

export default function Presupuesto() {
  const [categorias, setCategorias] = useState<Categoria[]>([
    {
      id: "ceremonia",
      nombre: "Ceremonia",
      gastos: [
        {
          id: generateId(),
          concepto: "Flores",
          proveedor: "Floristería Rosa",
          fecha: "2024-07-01",
          adjunto: "",
          previsto: 800,
          real: 750,
          estado: "Pagado",
          notas: "",
        },
        {
          id: generateId(),
          concepto: "Alquiler iglesia / finca",
          proveedor: "Iglesia San Juan",
          fecha: "2024-07-02",
          adjunto: "",
          previsto: 1000,
          real: 0,
          estado: "Pendiente",
          notas: "",
        },
      ],
    },
    {
      id: "banquete",
      nombre: "Banquete/Restaurante",
      gastos: [
        {
          id: generateId(),
          concepto: "Menú por persona",
          proveedor: "Restaurante El Buen Sabor",
          fecha: "2024-07-10",
          adjunto: "",
          previsto: 6000,
          real: 6200,
          estado: "Confirmado",
          notas: "",
        },
        {
          id: generateId(),
          concepto: "Barra libre",
          proveedor: "Barra Libre SL",
          fecha: "2024-07-10",
          adjunto: "",
          previsto: 1200,
          real: 1000,
          estado: "Pagado",
          notas: "",
        },
      ],
    },
    {
      id: "fotografia",
      nombre: "Fotografía y vídeo",
      gastos: [
        {
          id: generateId(),
          concepto: "Fotógrafo",
          proveedor: "FotoPro",
          fecha: "2024-07-08",
          adjunto: "",
          previsto: 1500,
          real: 0,
          estado: "Pendiente",
          notas: "",
        },
        {
          id: generateId(),
          concepto: "Vídeo",
          proveedor: "VideoEventos",
          fecha: "2024-07-08",
          adjunto: "",
          previsto: 1200,
          real: 0,
          estado: "Pendiente",
          notas: "",
        },
      ],
    },
    {
      id: "musica",
      nombre: "Música y animación",
      gastos: [
        {
          id: generateId(),
          concepto: "DJ y sonido",
          proveedor: "DJ Fiesta",
          fecha: "2024-07-10",
          adjunto: "",
          previsto: 1200,
          real: 0,
          estado: "Pendiente",
          notas: "",
        },
        {
          id: generateId(),
          concepto: "Animación infantil",
          proveedor: "Animaciones Kids",
          fecha: "2024-07-10",
          adjunto: "",
          previsto: 500,
          real: 0,
          estado: "Pendiente",
          notas: "",
        },
      ],
    },
    {
      id: "vestuario",
      nombre: "Vestuario y belleza",
      gastos: [
        {
          id: generateId(),
          concepto: "Vestido",
          proveedor: "Boutique Elegance",
          fecha: "2024-06-20",
          adjunto: "",
          previsto: 1500,
          real: 1400,
          estado: "Pagado",
          notas: "",
        },
        {
          id: generateId(),
          concepto: "Maquillaje y peluquería",
          proveedor: "Beauty Studio",
          fecha: "2024-07-10",
          adjunto: "",
          previsto: 300,
          real: 0,
          estado: "Pendiente",
          notas: "",
        },
      ],
    },
    {
      id: "invitaciones",
      nombre: "Invitaciones y papelería",
      gastos: [
        {
          id: generateId(),
          concepto: "Invitaciones",
          proveedor: "Imprenta Express",
          fecha: "2024-06-15",
          adjunto: "",
          previsto: 400,
          real: 400,
          estado: "Pagado",
          notas: "",
        },
        {
          id: generateId(),
          concepto: "Seating plan y carteles",
          proveedor: "Diseños Creativos",
          fecha: "2024-07-01",
          adjunto: "",
          previsto: 250,
          real: 0,
          estado: "Pendiente",
          notas: "",
        },
      ],
    },
    {
      id: "transporte",
      nombre: "Transporte y alojamiento",
      gastos: [
        {
          id: generateId(),
          concepto: "Alquiler coches",
          proveedor: "Rent a Car",
          fecha: "2024-07-10",
          adjunto: "",
          previsto: 600,
          real: 600,
          estado: "Pagado",
          notas: "",
        },
        {
          id: generateId(),
          concepto: "Hotel invitados",
          proveedor: "Hotel Central",
          fecha: "2024-07-10",
          adjunto: "",
          previsto: 2000,
          real: 1800,
          estado: "Confirmado",
          notas: "",
        },
      ],
    },
    {
      id: "otros",
      nombre: "Otros/imprevistos",
      gastos: [
        {
          id: generateId(),
          concepto: "Regalos",
          proveedor: "Tienda Regalos",
          fecha: "2024-07-05",
          adjunto: "",
          previsto: 300,
          real: 0,
          estado: "Pendiente",
          notas: "",
        },
        {
          id: generateId(),
          concepto: "Extras",
          proveedor: "",
          fecha: "",
          adjunto: "",
          previsto: 500,
          real: 0,
          estado: "Pendiente",
          notas: "",
        },
      ],
    },
  ]);

  const [abiertos, setAbiertos] = useState<string[]>([]);

  const toggleCategoria = (id: string) => {
    setAbiertos((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleChange = (
    catId: string,
    gastoId: string,
    campo: keyof Gasto,
    valor: string | number
  ) => {
    setCategorias((prev) =>
      prev.map((c) =>
        c.id === catId
          ? {
              ...c,
              gastos: c.gastos.map((g) =>
                g.id === gastoId
                  ? {
                      ...g,
                      [campo]:
                        campo === "previsto" || campo === "real"
                          ? Number(valor)
                          : valor,
                    }
                  : g
              ),
            }
          : c
      )
    );
  };

  const handleAddGasto = (catId: string) => {
    const newGasto: Gasto = {
      id: generateId(),
      concepto: "",
      proveedor: "",
      fecha: "",
      adjunto: "",
      previsto: 0,
      real: 0,
      estado: "Pendiente",
      notas: "",
    };
    setCategorias((prev) =>
      prev.map((c) =>
        c.id === catId ? { ...c, gastos: [...c.gastos, newGasto] } : c
      )
    );
    if (!abiertos.includes(catId)) {
      setAbiertos((prev) => [...prev, catId]);
    }
  };

  const handleRemoveGasto = (catId: string, gastoId: string) => {
    setCategorias((prev) =>
      prev.map((c) =>
        c.id === catId
          ? { ...c, gastos: c.gastos.filter((g) => g.id !== gastoId) }
          : c
      )
    );
  };

  const totalPrevisto = categorias.reduce(
    (acc, c) => acc + c.gastos.reduce((a, g) => a + g.previsto, 0),
    0
  );
  const totalReal = categorias.reduce(
    (acc, c) => acc + c.gastos.reduce((a, g) => a + g.real, 0),
    0
  );
  const diferencia = totalPrevisto - totalReal;
  const porcentajeGastado = totalPrevisto > 0 ? Math.min((totalReal / totalPrevisto) * 100, 100) : 0;

  // Color for difference: green if real <= previsto, red if real > previsto
  const diferenciaColor = diferencia >= 0 ? "text-green-400" : "text-red-400";


  // SVG circle parameters for progress ring
  const radius = 50;
  const stroke = 10;
  const normalizedRadius = radius - stroke * 0.5;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (porcentajeGastado / 100) * circumference;

  return (
    <section className="text-white p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-2">Gestión del Presupuesto</h1>
      <p className="text-white/70 text-sm mb-6">
        Aquí podrás llevar el control detallado de todos los gastos de la boda.
        <br />
        <strong>Total previsto</strong> es lo que planeas gastar.{" "}
        <strong>Total real</strong> refleja lo ya abonado o comprometido.{" "}
        <strong>Diferencia</strong> indica si vas por debajo o por encima del presupuesto.
      </p>

      <div className="bg-white/10 border border-white/10 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <p className="text-sm text-white/70">Total previsto: {totalPrevisto.toLocaleString()} €</p>
          <p className="text-sm text-white/70">Total real: {totalReal.toLocaleString()} €</p>
          <p className={`text-xl font-bold mt-1 ${diferenciaColor}`}>
            Diferencia: {diferencia.toLocaleString()} €
          </p>
        </div>
        <div className="flex justify-center items-center">
          <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
            <circle
              stroke="#444"
              fill="transparent"
              strokeWidth={stroke}
              r={normalizedRadius}
              cx={radius}
              cy={radius}
            />
            <circle
              stroke={porcentajeGastado > 100 ? "red" : "limegreen"}
              fill="transparent"
              strokeWidth={stroke}
              strokeDasharray={`${circumference} ${circumference}`}
              style={{ strokeDashoffset }}
              r={normalizedRadius}
              cx={radius}
              cy={radius}
              strokeLinecap="round"
            />
            <text
              x="50%"
              y="50%"
              dominantBaseline="middle"
              textAnchor="middle"
              fill="white"
              fontSize="16"
              fontWeight="bold"
            >
              {porcentajeGastado.toFixed(0)}%
            </text>
          </svg>
        </div>
      </div>

      {categorias.map((cat) => {
        const abierto = abiertos.includes(cat.id);
        const totalCatPrevisto = cat.gastos.reduce((a, g) => a + g.previsto, 0);
        const totalCatReal = cat.gastos.reduce((a, g) => a + g.real, 0);
        const diferenciaCat = totalCatPrevisto - totalCatReal;

        return (
          <div
            key={cat.id}
            className="bg-white/10 border border-white/10 rounded-lg p-4 backdrop-blur-md"
          >
            <button
              onClick={() => toggleCategoria(cat.id)}
              className="w-full flex justify-between items-center font-semibold text-lg hover:text-pink-300 transition"
              aria-expanded={abierto}
              aria-controls={`${cat.id}-content`}
            >
              <span>{cat.nombre}</span>
              <span>{abierto ? "▲" : "▼"}</span>
            </button>

            {abierto && (
              <div id={`${cat.id}-content`} className="mt-4 space-y-3">
                {cat.gastos.map((g) => (
                  <div
                    key={g.id}
                    className="grid grid-cols-12 gap-2 bg-black/20 border border-white/10 rounded p-3 items-center"
                  >
                    <input
                      type="text"
                      placeholder="Concepto"
                      value={g.concepto}
                      onChange={(e) =>
                        handleChange(cat.id, g.id, "concepto", e.target.value)
                      }
                      className="col-span-2 bg-black/30 border border-white/20 rounded px-2 py-1 text-white text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Proveedor"
                      value={g.proveedor || ""}
                      onChange={(e) =>
                        handleChange(cat.id, g.id, "proveedor", e.target.value)
                      }
                      className="col-span-2 bg-black/30 border border-white/20 rounded px-2 py-1 text-white text-sm"
                    />
                    <input
                      type="date"
                      placeholder="Fecha"
                      value={g.fecha || ""}
                      onChange={(e) =>
                        handleChange(cat.id, g.id, "fecha", e.target.value)
                      }
                      className="col-span-1 bg-black/30 border border-white/20 rounded px-2 py-1 text-white text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Adjunto"
                      value={g.adjunto || ""}
                      onChange={(e) =>
                        handleChange(cat.id, g.id, "adjunto", e.target.value)
                      }
                      className="col-span-2 bg-black/30 border border-white/20 rounded px-2 py-1 text-white text-sm"
                    />
                    <input
                      type="number"
                      placeholder="Previsto"
                      value={g.previsto}
                      onChange={(e) =>
                        handleChange(cat.id, g.id, "previsto", e.target.value)
                      }
                      className="col-span-1 bg-black/30 border border-white/20 rounded px-2 py-1 text-white text-sm"
                      min={0}
                    />
                    <input
                      type="number"
                      placeholder="Real"
                      value={g.real}
                      onChange={(e) =>
                        handleChange(cat.id, g.id, "real", e.target.value)
                      }
                      className={`col-span-1 border rounded px-2 py-1 text-sm ${
                        g.real > g.previsto
                          ? "border-red-500 text-red-500 bg-black/30"
                          : g.estado === "Pendiente"
                          ? "border-yellow-400 text-yellow-400 bg-black/30"
                          : "border-green-400 text-green-400 bg-black/30"
                      }`}
                      min={0}
                    />
                    <select
                      value={g.estado}
                      onChange={(e) =>
                        handleChange(cat.id, g.id, "estado", e.target.value)
                      }
                      className="col-span-1 bg-black/30 border border-white/20 rounded px-2 py-1 text-white text-sm"
                    >
                      <option>Pendiente</option>
                      <option>Pagado</option>
                      <option>Confirmado</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Notas"
                      value={g.notas || ""}
                      onChange={(e) =>
                        handleChange(cat.id, g.id, "notas", e.target.value)
                      }
                      className="col-span-1 bg-black/30 border border-white/20 rounded px-2 py-1 text-white text-sm"
                    />
                    <button
                      onClick={() => handleRemoveGasto(cat.id, g.id)}
                      className="col-span-1 text-red-500 hover:text-red-700 font-bold text-sm"
                      aria-label={`Eliminar gasto ${g.concepto}`}
                      type="button"
                    >
                      Eliminar
                    </button>
                  </div>
                ))}
                <div className="flex justify-between items-center mt-2">
                  <p className="text-sm text-white/70">
                    Total categoría:{" "}
                    <span className="text-pink-300">
                      {totalCatReal.toLocaleString()} € / {totalCatPrevisto.toLocaleString()} €
                    </span>{" "}
                    <span
                      className={`font-semibold ${
                        diferenciaCat >= 0 ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      ({diferenciaCat >= 0 ? "Dentro" : "Excedido"})
                    </span>
                  </p>
                  <button
                    onClick={() => handleAddGasto(cat.id)}
                    className="text-green-400 hover:text-green-600 font-semibold text-sm"
                    type="button"
                  >
                    Añadir gasto
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </section>
  );
}