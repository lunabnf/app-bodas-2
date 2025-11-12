import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
function generateId() {
    return Math.random().toString(36).substr(2, 9);
}
export default function Presupuesto() {
    const [categorias, setCategorias] = useState([
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
    const [abiertos, setAbiertos] = useState([]);
    const toggleCategoria = (id) => {
        setAbiertos((prev) => prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]);
    };
    const handleChange = (catId, gastoId, campo, valor) => {
        setCategorias((prev) => prev.map((c) => c.id === catId
            ? {
                ...c,
                gastos: c.gastos.map((g) => g.id === gastoId
                    ? {
                        ...g,
                        [campo]: campo === "previsto" || campo === "real"
                            ? Number(valor)
                            : valor,
                    }
                    : g),
            }
            : c));
    };
    const handleAddGasto = (catId) => {
        const newGasto = {
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
        setCategorias((prev) => prev.map((c) => c.id === catId ? { ...c, gastos: [...c.gastos, newGasto] } : c));
        if (!abiertos.includes(catId)) {
            setAbiertos((prev) => [...prev, catId]);
        }
    };
    const handleRemoveGasto = (catId, gastoId) => {
        setCategorias((prev) => prev.map((c) => c.id === catId
            ? { ...c, gastos: c.gastos.filter((g) => g.id !== gastoId) }
            : c));
    };
    const totalPrevisto = categorias.reduce((acc, c) => acc + c.gastos.reduce((a, g) => a + g.previsto, 0), 0);
    const totalReal = categorias.reduce((acc, c) => acc + c.gastos.reduce((a, g) => a + g.real, 0), 0);
    const diferencia = totalPrevisto - totalReal;
    const porcentajeGastado = totalPrevisto > 0 ? Math.min((totalReal / totalPrevisto) * 100, 100) : 0;
    // Color for difference: green if real <= previsto, red if real > previsto
    const diferenciaColor = diferencia >= 0 ? "text-green-400" : "text-red-400";
    // Color by estado for each gasto: Pagado=green, Pendiente=yellow, Confirmado=green (treat as paid)
    const estadoColor = (estado, previsto, real) => {
        if (real > previsto)
            return "text-red-500";
        if (estado === "Pagado" || estado === "Confirmado")
            return "text-green-400";
        if (estado === "Pendiente")
            return "text-yellow-400";
        return "text-white";
    };
    // SVG circle parameters for progress ring
    const radius = 50;
    const stroke = 10;
    const normalizedRadius = radius - stroke * 0.5;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (porcentajeGastado / 100) * circumference;
    return (_jsxs("section", { className: "text-white p-6 space-y-6", children: [_jsx("h1", { className: "text-2xl font-bold mb-2", children: "Gesti\u00F3n del Presupuesto" }), _jsxs("p", { className: "text-white/70 text-sm mb-6", children: ["Aqu\u00ED podr\u00E1s llevar el control detallado de todos los gastos de la boda.", _jsx("br", {}), _jsx("strong", { children: "Total previsto" }), " es lo que planeas gastar.", " ", _jsx("strong", { children: "Total real" }), " refleja lo ya abonado o comprometido.", " ", _jsx("strong", { children: "Diferencia" }), " indica si vas por debajo o por encima del presupuesto."] }), _jsxs("div", { className: "bg-white/10 border border-white/10 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0", children: [_jsxs("div", { children: [_jsxs("p", { className: "text-sm text-white/70", children: ["Total previsto: ", totalPrevisto.toLocaleString(), " \u20AC"] }), _jsxs("p", { className: "text-sm text-white/70", children: ["Total real: ", totalReal.toLocaleString(), " \u20AC"] }), _jsxs("p", { className: `text-xl font-bold mt-1 ${diferenciaColor}`, children: ["Diferencia: ", diferencia.toLocaleString(), " \u20AC"] })] }), _jsx("div", { className: "flex justify-center items-center", children: _jsxs("svg", { height: radius * 2, width: radius * 2, className: "transform -rotate-90", children: [_jsx("circle", { stroke: "#444", fill: "transparent", strokeWidth: stroke, r: normalizedRadius, cx: radius, cy: radius }), _jsx("circle", { stroke: porcentajeGastado > 100 ? "red" : "limegreen", fill: "transparent", strokeWidth: stroke, strokeDasharray: `${circumference} ${circumference}`, style: { strokeDashoffset }, r: normalizedRadius, cx: radius, cy: radius, strokeLinecap: "round" }), _jsxs("text", { x: "50%", y: "50%", dominantBaseline: "middle", textAnchor: "middle", fill: "white", fontSize: "16", fontWeight: "bold", children: [porcentajeGastado.toFixed(0), "%"] })] }) })] }), categorias.map((cat) => {
                const abierto = abiertos.includes(cat.id);
                const totalCatPrevisto = cat.gastos.reduce((a, g) => a + g.previsto, 0);
                const totalCatReal = cat.gastos.reduce((a, g) => a + g.real, 0);
                const diferenciaCat = totalCatPrevisto - totalCatReal;
                return (_jsxs("div", { className: "bg-white/10 border border-white/10 rounded-lg p-4 backdrop-blur-md", children: [_jsxs("button", { onClick: () => toggleCategoria(cat.id), className: "w-full flex justify-between items-center font-semibold text-lg hover:text-pink-300 transition", "aria-expanded": abierto, "aria-controls": `${cat.id}-content`, children: [_jsx("span", { children: cat.nombre }), _jsx("span", { children: abierto ? "▲" : "▼" })] }), abierto && (_jsxs("div", { id: `${cat.id}-content`, className: "mt-4 space-y-3", children: [cat.gastos.map((g) => (_jsxs("div", { className: "grid grid-cols-12 gap-2 bg-black/20 border border-white/10 rounded p-3 items-center", children: [_jsx("input", { type: "text", placeholder: "Concepto", value: g.concepto, onChange: (e) => handleChange(cat.id, g.id, "concepto", e.target.value), className: "col-span-2 bg-black/30 border border-white/20 rounded px-2 py-1 text-white text-sm" }), _jsx("input", { type: "text", placeholder: "Proveedor", value: g.proveedor || "", onChange: (e) => handleChange(cat.id, g.id, "proveedor", e.target.value), className: "col-span-2 bg-black/30 border border-white/20 rounded px-2 py-1 text-white text-sm" }), _jsx("input", { type: "date", placeholder: "Fecha", value: g.fecha || "", onChange: (e) => handleChange(cat.id, g.id, "fecha", e.target.value), className: "col-span-1 bg-black/30 border border-white/20 rounded px-2 py-1 text-white text-sm" }), _jsx("input", { type: "text", placeholder: "Adjunto", value: g.adjunto || "", onChange: (e) => handleChange(cat.id, g.id, "adjunto", e.target.value), className: "col-span-2 bg-black/30 border border-white/20 rounded px-2 py-1 text-white text-sm" }), _jsx("input", { type: "number", placeholder: "Previsto", value: g.previsto, onChange: (e) => handleChange(cat.id, g.id, "previsto", e.target.value), className: "col-span-1 bg-black/30 border border-white/20 rounded px-2 py-1 text-white text-sm", min: 0 }), _jsx("input", { type: "number", placeholder: "Real", value: g.real, onChange: (e) => handleChange(cat.id, g.id, "real", e.target.value), className: `col-span-1 border rounded px-2 py-1 text-sm ${g.real > g.previsto
                                                ? "border-red-500 text-red-500 bg-black/30"
                                                : g.estado === "Pendiente"
                                                    ? "border-yellow-400 text-yellow-400 bg-black/30"
                                                    : "border-green-400 text-green-400 bg-black/30"}`, min: 0 }), _jsxs("select", { value: g.estado, onChange: (e) => handleChange(cat.id, g.id, "estado", e.target.value), className: `col-span-1 bg-black/30 border border-white/20 rounded px-2 py-1 text-sm ${estadoColor(g.estado, g.previsto, g.real)}`, children: [_jsx("option", { children: "Pendiente" }), _jsx("option", { children: "Pagado" }), _jsx("option", { children: "Confirmado" })] }), _jsx("input", { type: "text", placeholder: "Notas", value: g.notas || "", onChange: (e) => handleChange(cat.id, g.id, "notas", e.target.value), className: "col-span-1 bg-black/30 border border-white/20 rounded px-2 py-1 text-white text-sm" }), _jsx("button", { onClick: () => handleRemoveGasto(cat.id, g.id), className: "col-span-1 text-red-500 hover:text-red-700 font-bold text-sm", "aria-label": `Eliminar gasto ${g.concepto}`, type: "button", children: "Eliminar" })] }, g.id))), _jsxs("div", { className: "flex justify-between items-center mt-2", children: [_jsxs("p", { className: "text-sm text-white/70", children: ["Total categor\u00EDa:", " ", _jsxs("span", { className: "text-pink-300", children: [totalCatReal.toLocaleString(), " \u20AC / ", totalCatPrevisto.toLocaleString(), " \u20AC"] }), " ", _jsxs("span", { className: `font-semibold ${diferenciaCat >= 0 ? "text-green-400" : "text-red-400"}`, children: ["(", diferenciaCat >= 0 ? "Dentro" : "Excedido", ")"] })] }), _jsx("button", { onClick: () => handleAddGasto(cat.id), className: "text-green-400 hover:text-green-600 font-semibold text-sm", type: "button", children: "A\u00F1adir gasto" })] })] }))] }, cat.id));
            })] }));
}
