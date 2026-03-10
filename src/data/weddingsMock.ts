export type WeddingMock = {
  id: string;
  nombre: string;
  slug: string;
  codigo: string;
};

const WEDDINGS: WeddingMock[] = [
  {
    id: "evt-garcia-lopez",
    nombre: "Boda Garcia & Lopez",
    slug: "garcia-lopez",
    codigo: "GL-2026",
  },
  {
    id: "evt-maria-javier",
    nombre: "Boda Maria & Javier",
    slug: "maria-javier",
    codigo: "MJ-2026",
  },
];

export function listWeddings(): WeddingMock[] {
  return WEDDINGS;
}

export function getWeddingBySlug(slug: string): WeddingMock | null {
  const normalized = slug.trim().toLowerCase();
  if (!normalized) return null;
  return WEDDINGS.find((wedding) => wedding.slug.toLowerCase() === normalized) ?? null;
}

export function searchWeddings(query: string): WeddingMock[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return WEDDINGS;
  return WEDDINGS.filter((wedding) => {
    return (
      wedding.nombre.toLowerCase().includes(normalized) ||
      wedding.slug.toLowerCase().includes(normalized) ||
      wedding.codigo.toLowerCase().includes(normalized)
    );
  });
}
