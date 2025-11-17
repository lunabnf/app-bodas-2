export function getUsuarioActual() {
  const raw = localStorage.getItem("wedding.user");
  return raw ? JSON.parse(raw) : null;
}
