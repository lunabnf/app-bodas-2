import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { loadSongsSorted, proposeSong, voteSong, } from "../application/guestParticipationService";
import { useAuth } from "../store/useAuth";
export default function Musica() {
    const { invitado } = useAuth();
    const [canciones, setCanciones] = useState([]);
    const [titulo, setTitulo] = useState("");
    const [artista, setArtista] = useState("");
    const [error, setError] = useState("");
    const cargar = async () => {
        setCanciones(await loadSongsSorted());
    };
    useEffect(() => {
        void cargar();
    }, []);
    const propuestasDeEsteInvitado = canciones.filter((c) => c.propuestaPorToken === invitado?.token).length;
    const handleProponer = async () => {
        setError("");
        const result = await proposeSong({
            invitado,
            canciones,
            titulo,
            artista,
        });
        if (!result.ok) {
            setError(result.error);
            return;
        }
        setTitulo("");
        setArtista("");
        await cargar();
    };
    const handleVotar = async (id) => {
        const result = await voteSong({
            invitado,
            songId: id,
            canciones,
        });
        if (!result.ok) {
            setError(result.error);
            return;
        }
        await cargar();
    };
    return (_jsxs("div", { className: "p-6 text-white space-y-6", children: [_jsx("h1", { className: "text-3xl font-bold", children: "M\u00FAsica" }), _jsxs("div", { className: "space-y-3 bg-white/10 p-4 rounded-lg border border-white/20", children: [_jsx("h2", { className: "text-xl font-semibold", children: "Proponer canci\u00F3n" }), _jsx("input", { type: "text", placeholder: "T\u00EDtulo", value: titulo, onChange: (e) => setTitulo(e.target.value), className: "w-full p-2 rounded text-black" }), _jsx("input", { type: "text", placeholder: "Artista", value: artista, onChange: (e) => setArtista(e.target.value), className: "w-full p-2 rounded text-black" }), error && _jsx("p", { className: "text-red-300 text-sm", children: error }), _jsx("button", { onClick: handleProponer, className: "bg-white text-black px-4 py-2 rounded-lg mt-2", children: "Proponer" }), _jsxs("p", { className: "text-sm opacity-70", children: ["Propuestas realizadas: ", propuestasDeEsteInvitado, " / 2"] })] }), _jsxs("div", { className: "space-y-3", children: [_jsx("h2", { className: "text-xl font-semibold", children: "Canciones propuestas" }), canciones.length === 0 && (_jsx("p", { className: "opacity-70", children: "Todav\u00EDa no hay canciones." })), _jsx("div", { className: "space-y-3", children: canciones.map((c) => (_jsxs("div", { className: "p-4 bg-white/10 border border-white/20 rounded-lg flex justify-between items-center", children: [_jsxs("div", { children: [_jsx("p", { className: "font-semibold", children: c.titulo }), _jsx("p", { className: "opacity-80 text-sm", children: c.artista }), _jsxs("p", { className: "text-xs opacity-60 mt-1", children: ["Votos: ", c.votos] })] }), _jsx("button", { onClick: () => handleVotar(c.id), className: "bg-white text-black px-3 py-1 rounded", children: "Votar" })] }, c.id))) })] })] }));
}
