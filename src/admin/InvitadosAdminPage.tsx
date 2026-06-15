import { useEffect, useMemo, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { useParams } from "react-router-dom";
import { getBrowserLocation } from "../lib/browser";
import type { Guest, GuestStatus, GuestType } from "../domain/guest";
import {
  createEmptyGuestDraft,
  createGuest,
  mapInvitationSummaryByGuest,
  type GuestDraft,
  loadGuestsAdminData,
  removeGuest,
} from "../application/adminGuestsService";

export default function Invitados() {
  const { slug } = useParams();
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState("todos");
  const [invitados, setInvitados] = useState<Guest[]>([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [nuevoInvitado, setNuevoInvitado] = useState<GuestDraft>(createEmptyGuestDraft());

  const [mostrarQR, setMostrarQR] = useState(false);
  const [invitadoQR, setInvitadoQR] = useState<Guest | null>(null);
  const [invitationSummaryByGuest, setInvitationSummaryByGuest] = useState<
    Record<string, { invitationStatus: string; activeAttendees: number; responseCount: number }>
  >({});

  useEffect(() => {
    void loadGuestsAdminData().then(({ invitados: loadedInvitados }) => {
      setInvitados(loadedInvitados);
      setInvitationSummaryByGuest(mapInvitationSummaryByGuest(loadedInvitados));
    });
  }, []);

  const rsvpBaseUrl = useMemo(() => {
    const origin = getBrowserLocation()?.origin ?? "";
    const resolvedSlug = slug ?? "demo";
    return `${origin}/w/${resolvedSlug}/rsvp`;
  }, [slug]);

  const invitadosFiltrados = invitados.filter(
    (i) =>
      (filtro === "todos" || i.estado === filtro) &&
      i.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const resumenGrupos = invitados.reduce((acc, inv) => {
    acc[inv.grupoTipo] = (acc[inv.grupoTipo] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const confirmedCount = invitados.filter((guest) => guest.estado === "confirmado").length;
  const pendingCount = invitados.filter((guest) => guest.estado === "pendiente").length;
  const rejectedCount = invitados.filter((guest) => guest.estado === "rechazado").length;
  const responseRate =
    invitados.length === 0 ? 0 : Math.round(((confirmedCount + rejectedCount) / invitados.length) * 100);

  const abrirModal = () => {
    setNuevoInvitado(createEmptyGuestDraft());
    setMostrarModal(true);
  };

  const guardarInvitado = async () => {
    const invitadoAGuardar = await createGuest(invitados, nuevoInvitado);
    if (!invitadoAGuardar) {
      return;
    }
    const updated = [...invitados, invitadoAGuardar];
    setInvitados(updated);
    setInvitationSummaryByGuest(mapInvitationSummaryByGuest(updated));
    setMostrarModal(false);
    setNuevoInvitado(createEmptyGuestDraft());
  };

  return (
    <div className="space-y-6 text-[var(--app-ink)]">
      <section className="app-surface p-6 sm:p-8 lg:p-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="app-kicker">Invitados y RSVP</p>
            <h1 className="app-page-title mt-4">Las personas que forman parte del día.</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--app-muted)]">
              Gestiona la lista, revisa confirmaciones y abre cada invitación personal desde un único lugar.
            </p>
          </div>
          <button onClick={abrirModal} className="app-button-primary self-start lg:self-auto">
            Añadir invitado
          </button>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Invitados", value: invitados.length, detail: "personas en la lista" },
          { label: "Confirmados", value: confirmedCount, detail: "asistirán a la boda" },
          { label: "Pendientes", value: pendingCount, detail: "respuestas por recibir" },
          { label: "RSVP recibido", value: `${responseRate}%`, detail: `${rejectedCount} no asistirán` },
        ].map((item) => (
          <article key={item.label} className="app-surface-soft p-5 sm:p-6">
            <p className="text-sm text-[var(--app-muted)]">{item.label}</p>
            <p className="mt-4 text-4xl font-semibold tracking-[-0.05em]">{item.value}</p>
            <p className="mt-2 text-sm text-[var(--app-muted)]">{item.detail}</p>
          </article>
        ))}
      </section>

      {Object.keys(resumenGrupos).length > 0 ? (
        <section className="app-surface-soft p-5 sm:p-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="app-kicker">Grupos</p>
              <h2 className="mt-3 text-xl font-semibold tracking-[-0.03em]">Distribución de la lista</h2>
            </div>
            <p className="text-sm text-[var(--app-muted)]">{Object.keys(resumenGrupos).length} grupos activos</p>
          </div>
          <div className="mt-5 flex gap-3 overflow-x-auto pb-1">
            {Object.entries(resumenGrupos).map(([grupo, cantidad]) => (
              <div key={grupo} className="min-w-40 rounded-[18px] border border-[var(--app-line)] bg-white/70 p-4">
                <p className="text-sm capitalize text-[var(--app-muted)]">{grupo.replace(/_/g, " ")}</p>
                <p className="mt-2 text-2xl font-semibold tracking-[-0.04em]">{cantidad}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="app-surface-soft overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-[var(--app-line)] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
            <p className="app-kicker">Lista principal</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em]">Invitados</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-[minmax(15rem,1fr)_11rem]">
            <input
              type="search"
              placeholder="Buscar por nombre"
              className="w-full p-3"
              value={busqueda}
              onChange={(event) => setBusqueda(event.target.value)}
            />
            <select
              className="w-full p-3"
              value={filtro}
              onChange={(event) => setFiltro(event.target.value)}
            >
              <option value="todos">Todos los estados</option>
              <option value="confirmado">Confirmados</option>
              <option value="pendiente">Pendientes</option>
              <option value="rechazado">No asistirán</option>
            </select>
          </div>
        </div>

        {invitadosFiltrados.length === 0 ? (
          <div className="p-6 sm:p-10">
            <div className="mx-auto max-w-xl rounded-[24px] border border-dashed border-[var(--app-line-strong)] bg-white/55 p-8 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-[var(--app-line)] bg-white text-lg">
                +
              </div>
              <h3 className="mt-5 text-xl font-semibold">
                {invitados.length === 0 ? "Aún no hay invitados" : "No hay resultados para este filtro"}
              </h3>
              <p className="mt-2 text-sm leading-6 text-[var(--app-muted)]">
                {invitados.length === 0
                  ? "Empieza creando la primera invitación. Podrás generar su QR y seguir el estado del RSVP."
                  : "Prueba con otro nombre o muestra todos los estados."}
              </p>
              {invitados.length === 0 ? (
                <button onClick={abrirModal} className="app-button-primary mt-6">
                  Añadir primer invitado
                </button>
              ) : null}
            </div>
          </div>
        ) : (
          <>
            <div className="grid gap-3 p-4 md:hidden">
              {invitadosFiltrados.map((inv) => (
                <article key={inv.id} className="rounded-[20px] border border-[var(--app-line)] bg-white/72 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{inv.nombre}</p>
                      <p className="mt-1 text-sm text-[var(--app-muted)]">{inv.grupo || inv.grupoTipo.replace(/_/g, " ")}</p>
                    </div>
                    <span className="rounded-full border border-[var(--app-line)] px-3 py-1 text-xs capitalize text-[var(--app-muted)]">
                      {inv.estado}
                    </span>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-[var(--app-muted)]">Invitación</p>
                      <p className="mt-1 capitalize">{invitationSummaryByGuest[inv.token]?.invitationStatus ?? "pendiente"}</p>
                    </div>
                    <div>
                      <p className="text-[var(--app-muted)]">Mesa</p>
                      <p className="mt-1">{inv.mesa || "Sin asignar"}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setInvitadoQR(inv);
                        setMostrarQR(true);
                      }}
                      className="app-button-secondary"
                    >
                      Ver QR
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        await removeGuest(inv.token, inv.nombre);
                        const { invitados: loadedInvitados } = await loadGuestsAdminData();
                        setInvitados(loadedInvitados);
                        setInvitationSummaryByGuest(mapInvitationSummaryByGuest(loadedInvitados));
                      }}
                      className="app-button-secondary"
                    >
                      {inv.invitationRole !== "acompanante" ? "Cancelar" : "Eliminar"}
                    </button>
                  </div>
                </article>
              ))}
            </div>

            <div className="app-table-wrap hidden rounded-none border-x-0 border-b-0 shadow-none md:block">
              <table className="app-table min-w-[920px]">
                <thead>
                  <tr>
                    <th>Invitado</th>
                    <th>Grupo</th>
                    <th>Estado</th>
                    <th>Invitación</th>
                    <th>Asistentes</th>
                    <th>Mesa</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {invitadosFiltrados.map((inv) => (
                    <tr key={inv.id}>
                      <td>
                        <p className="font-semibold">{inv.nombre}</p>
                        <p className="mt-1 text-xs text-[var(--app-muted)]">{inv.tipo}</p>
                      </td>
                      <td>{inv.grupo || inv.grupoTipo.replace(/_/g, " ")}</td>
                      <td>
                        <span className="rounded-full border border-[var(--app-line)] bg-white/70 px-3 py-1 text-xs capitalize">
                          {inv.estado}
                        </span>
                      </td>
                      <td className="capitalize">
                        {invitationSummaryByGuest[inv.token]?.invitationStatus ?? "pendiente"}
                      </td>
                      <td>
                        {invitationSummaryByGuest[inv.token]?.activeAttendees ??
                          (inv.estado === "confirmado" ? 1 : 0)}
                      </td>
                      <td>{inv.mesa || "Sin asignar"}</td>
                      <td>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setInvitadoQR(inv);
                              setMostrarQR(true);
                            }}
                            className="app-button-secondary !min-h-0 !px-3 !py-2 text-sm"
                          >
                            Ver QR
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              await removeGuest(inv.token, inv.nombre);
                              const { invitados: loadedInvitados } = await loadGuestsAdminData();
                              setInvitados(loadedInvitados);
                              setInvitationSummaryByGuest(mapInvitationSummaryByGuest(loadedInvitados));
                            }}
                            className="app-button-secondary !min-h-0 !px-3 !py-2 text-sm"
                          >
                            {inv.invitationRole !== "acompanante" ? "Cancelar" : "Eliminar"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>

      {mostrarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(24,24,23,0.28)] p-4 backdrop-blur-sm">
          <div className="app-surface max-h-[90vh] w-full max-w-xl overflow-y-auto p-6 sm:p-8">
            <p className="app-kicker">Nueva invitación</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em]">Añadir invitado</h2>
            <p className="mt-2 text-sm text-[var(--app-muted)]">
              Completa los datos básicos. Después podrás compartir su enlace o QR personal.
            </p>
            <form
              className="mt-6"
              onSubmit={(e) => {
                e.preventDefault();
                void guardarInvitado();
              }}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 sm:col-span-2">
                  <span className="text-sm font-medium text-[var(--app-muted)]">Nombre</span>
                <input
                  type="text"
                    className="w-full p-3"
                  value={nuevoInvitado.nombre}
                  onChange={(e) => setNuevoInvitado({ ...nuevoInvitado, nombre: e.target.value })}
                  required
                />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-[var(--app-muted)]">Tipo</span>
                    <select
                    className="w-full p-3"
                      value={nuevoInvitado.tipo}
                      onChange={(e) =>
                        setNuevoInvitado({
                          ...nuevoInvitado,
                          tipo: e.target.value as GuestType,
                        })
                      }
                    >
                  <option value="Adulto">Adulto</option>
                  <option value="Niño">Niño</option>
                </select>
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-[var(--app-muted)]">Grupo</span>
                <input
                  type="text"
                    className="w-full p-3"
                  value={nuevoInvitado.grupo}
                  onChange={(e) => setNuevoInvitado({ ...nuevoInvitado, grupo: e.target.value })}
                  required
                />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-[var(--app-muted)]">Tipo de grupo</span>
                <select
                    className="w-full p-3"
                  value={nuevoInvitado.grupoTipo}
                  onChange={(e) =>
                    setNuevoInvitado({
                      ...nuevoInvitado,
                      grupoTipo: e.target.value as Guest["grupoTipo"],
                    })
                  }
                >
                  <option value="familia_novia">Familia de la novia</option>
                  <option value="familia_novio">Familia del novio</option>
                  <option value="amigos_novia">Amigos de la novia</option>
                  <option value="amigos_novio">Amigos del novio</option>
                  <option value="amigos_comunes">Amigos comunes</option>
                  <option value="amigos_trabajo">Amigos del trabajo</option>
                  <option value="amigos_pueblo">Amigos del pueblo</option>
                  <option value="proveedores">Proveedores</option>
                  <option value="otros">Otros</option>
                </select>
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-[var(--app-muted)]">Estado</span>
                <select
                    className="w-full p-3"
                  value={nuevoInvitado.estado}
                  onChange={(e) =>
                    setNuevoInvitado({
                      ...nuevoInvitado,
                      estado: e.target.value as GuestStatus,
                    })
                  }
                >
                  <option value="confirmado">Confirmado</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="rechazado">Rechazado</option>
                </select>
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-[var(--app-muted)]">Mesa (opcional)</span>
                <input
                  type="text"
                    className="w-full p-3"
                  value={nuevoInvitado.mesa || ""}
                  onChange={(e) => setNuevoInvitado({ ...nuevoInvitado, mesa: e.target.value })}
                />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-medium text-[var(--app-muted)]">Edad (opcional)</span>
                <input
                  type="number"
                  min="0"
                    className="w-full p-3"
                  value={nuevoInvitado.edad ?? ""}
                  onChange={(e) =>
                    setNuevoInvitado((current) =>
                      e.target.value
                        ? { ...current, edad: Number(e.target.value) }
                        : (() => {
                            const rest = { ...current };
                            delete rest.edad;
                            return rest;
                          })()
                    )
                  }
                />
                </label>
              </div>
              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setMostrarModal(false)}
                  className="app-button-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="app-button-primary"
                >
                  Guardar invitado
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {mostrarQR && invitadoQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(24,24,23,0.28)] p-4 backdrop-blur-sm">
          <div className="app-surface w-full max-w-sm p-6 text-center sm:p-8">
            <p className="app-kicker">Invitación personal</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em]">{invitadoQR.nombre}</h2>
            <div className="mx-auto mt-6 w-fit rounded-[22px] border border-[var(--app-line)] bg-white p-3">
              <QRCodeCanvas
                value={`${rsvpBaseUrl}/${encodeURIComponent(invitadoQR.token)}`}
                size={200}
                bgColor="#ffffff"
                fgColor="#181817"
                includeMargin={true}
              />
            </div>
            <p className="mt-4 break-all text-sm leading-6 text-[var(--app-muted)]">
              {rsvpBaseUrl}/{invitadoQR.token}
            </p>
            <button
              onClick={() => setMostrarQR(false)}
              className="app-button-primary mt-6 w-full"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
