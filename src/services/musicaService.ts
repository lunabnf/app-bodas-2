import { z } from "zod";
import type { MusicSongSummary, SongProposal, SongVote } from "../domain/music";
import { songProposalSchema, songVoteSchema } from "../domain/schemas";
import { readStorageWithSchema, writeStorage } from "../lib/storage";
import { scopedStorageKey } from "./eventScopeService";
import { supabaseConfig } from "./supabaseConfig";

export interface Cancion {
  id: string;
  titulo: string;
  artista: string;
  enlace?: string;
  propuestaPorToken: string;
  visible?: boolean;
  createdAt?: number;
  votos: number;
}

type LegacySong = {
  id?: string;
  titulo?: string;
  artista?: string;
  propuestaPorToken?: string;
  votos?: number;
};

const PROPOSALS_STORAGE_KEY = "wedding_musica";
const VOTES_STORAGE_KEY = "wedding_musica_votes";
const LEGACY_STORAGE_KEYS = ["wedding_musica"];
const proposalListSchema = z.array(songProposalSchema);
const voteListSchema = z.array(songVoteSchema);
const legacySongListSchema = z.array(
  z.object({
    id: z.string().optional(),
    titulo: z.string().optional(),
    artista: z.string().optional(),
    propuestaPorToken: z.string().optional(),
    votos: z.number().optional(),
  })
);

function readLocalStorage<T>(key: string, schema: z.ZodTypeAny, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  return readStorageWithSchema<T>(key, schema, fallback);
}

function writeLocalStorage<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  writeStorage(key, value);
}

function normalizeText(value: string) {
  return value.trim().toLowerCase();
}

function normalizeLegacySong(raw: LegacySong, index: number): SongProposal | null {
  const title = raw.titulo?.trim();
  const artist = raw.artista?.trim();
  if (!title || !artist) return null;

  return {
    id: raw.id?.trim() || crypto.randomUUID(),
    title,
    artist,
    proposerGuestToken: raw.propuestaPorToken?.trim() || `legacy-proposal-${index + 1}`,
    visible: true,
    createdAt: Date.now() - (index + 1) * 1000,
    ...(typeof raw.votos === "number" && raw.votos > 0 ? { legacyVotesBase: raw.votos } : {}),
  };
}

function readProposalCandidates(): SongProposal[] {
  const scopedKey = scopedStorageKey(PROPOSALS_STORAGE_KEY);
  const candidates = [scopedKey, ...LEGACY_STORAGE_KEYS];

  for (const key of candidates) {
    const proposals = readLocalStorage<SongProposal[]>(key, proposalListSchema, []);
    if (proposals.length > 0) {
      if (key !== scopedKey) {
        writeLocalStorage(scopedKey, proposals);
        localStorage.removeItem(key);
      }
      return proposals;
    }

    const legacySongs = readLocalStorage<LegacySong[]>(key, legacySongListSchema, []);
    if (legacySongs.length > 0) {
      const migrated = legacySongs
        .map((item, index) => normalizeLegacySong(item, index))
        .filter((item): item is SongProposal => item !== null);

      writeLocalStorage(scopedKey, migrated);
      if (key !== scopedKey) {
        localStorage.removeItem(key);
      }
      return migrated;
    }
  }

  return [];
}

function readVoteCandidates(): SongVote[] {
  const scopedKey = scopedStorageKey(VOTES_STORAGE_KEY);
  return readLocalStorage<SongVote[]>(scopedKey, voteListSchema, []);
}

function writeProposals(proposals: SongProposal[]) {
  writeLocalStorage(scopedStorageKey(PROPOSALS_STORAGE_KEY), proposals);
}

function writeVotes(votes: SongVote[]) {
  writeLocalStorage(scopedStorageKey(VOTES_STORAGE_KEY), votes);
}

function sortByRecentThenTitle(items: SongProposal[]) {
  return [...items].sort((a, b) => b.createdAt - a.createdAt || a.title.localeCompare(b.title));
}

function buildSummary(proposal: SongProposal, votes: SongVote[]): MusicSongSummary {
  const dynamicVotes = votes.filter((vote) => vote.proposalId === proposal.id).length;

  return {
    id: proposal.id,
    title: proposal.title,
    artist: proposal.artist,
    ...(proposal.url ? { url: proposal.url } : {}),
    proposerGuestToken: proposal.proposerGuestToken,
    visible: proposal.visible,
    createdAt: proposal.createdAt,
    voteCount: (proposal.legacyVotesBase ?? 0) + dynamicVotes,
  };
}

function proposalToLegacySong(summary: MusicSongSummary): Cancion {
  return {
    id: summary.id,
    titulo: summary.title,
    artista: summary.artist,
    ...(summary.url ? { enlace: summary.url } : {}),
    propuestaPorToken: summary.proposerGuestToken,
    visible: summary.visible,
    createdAt: summary.createdAt,
    votos: summary.voteCount,
  };
}

export async function obtenerSongProposals(): Promise<SongProposal[]> {
  if (!supabaseConfig.enabled) {
    return sortByRecentThenTitle(readProposalCandidates());
  }

  // FUTURO: Supabase/Firebase
  return [];
}

export async function obtenerSongVotes(): Promise<SongVote[]> {
  if (!supabaseConfig.enabled) {
    return readVoteCandidates();
  }

  // FUTURO: Supabase/Firebase
  return [];
}

export async function obtenerMusicSongSummaries(includeHidden = true): Promise<MusicSongSummary[]> {
  const [proposals, votes] = await Promise.all([obtenerSongProposals(), obtenerSongVotes()]);
  const summaries = proposals.map((proposal) => buildSummary(proposal, votes));

  return summaries
    .filter((item) => includeHidden || item.visible)
    .sort((a, b) => b.voteCount - a.voteCount || b.createdAt - a.createdAt || a.title.localeCompare(b.title));
}

export async function obtenerCanciones(): Promise<Cancion[]> {
  const summaries = await obtenerMusicSongSummaries(true);
  return summaries.map(proposalToLegacySong);
}

export async function guardarSongProposal(proposal: SongProposal): Promise<boolean> {
  const proposals = await obtenerSongProposals();
  const next = [...proposals];
  const index = next.findIndex((item) => item.id === proposal.id);

  if (index === -1) {
    next.push(proposal);
  } else {
    next[index] = proposal;
  }

  if (!supabaseConfig.enabled) {
    writeProposals(next);
    return true;
  }

  // FUTURO: Supabase/Firebase
  return true;
}

export async function guardarCancion(cancion: Cancion): Promise<boolean> {
  return guardarSongProposal({
    id: cancion.id,
    title: cancion.titulo.trim(),
    artist: cancion.artista.trim(),
    ...(cancion.enlace?.trim() ? { url: cancion.enlace.trim() } : {}),
    proposerGuestToken: cancion.propuestaPorToken,
    visible: typeof cancion.visible === "boolean" ? cancion.visible : true,
    createdAt: cancion.createdAt || Date.now(),
    ...(cancion.votos > 0 ? { legacyVotesBase: cancion.votos } : {}),
  });
}

export async function findExactSongDuplicate(title: string, artist: string): Promise<MusicSongSummary | null> {
  const normalizedTitle = normalizeText(title);
  const normalizedArtist = normalizeText(artist);
  const summaries = await obtenerMusicSongSummaries(true);

  return (
    summaries.find(
      (item) =>
        normalizeText(item.title) === normalizedTitle &&
        normalizeText(item.artist) === normalizedArtist
    ) ?? null
  );
}

export async function countGuestSongProposals(guestToken: string): Promise<number> {
  const proposals = await obtenerSongProposals();
  return proposals.filter((item) => item.proposerGuestToken === guestToken).length;
}

export async function hasGuestVotedSong(proposalId: string, guestToken: string): Promise<boolean> {
  const votes = await obtenerSongVotes();
  return votes.some((vote) => vote.proposalId === proposalId && vote.guestToken === guestToken);
}

export async function toggleSongVote(
  proposalId: string,
  guestToken: string
): Promise<{ ok: true; voted: boolean } | { ok: false }> {
  const [proposals, votes] = await Promise.all([obtenerSongProposals(), obtenerSongVotes()]);
  if (!proposals.some((proposal) => proposal.id === proposalId)) {
    return { ok: false };
  }

  const existing = votes.find(
    (vote) => vote.proposalId === proposalId && vote.guestToken === guestToken
  );

  const nextVotes = existing
    ? votes.filter((vote) => vote.id !== existing.id)
    : [
        ...votes,
        {
          id: crypto.randomUUID(),
          proposalId,
          guestToken,
          createdAt: Date.now(),
        },
      ];

  if (!supabaseConfig.enabled) {
    writeVotes(nextVotes);
    return { ok: true, voted: !existing };
  }

  // FUTURO: Supabase/Firebase
  return { ok: true, voted: !existing };
}

export async function votarCancion(id: string): Promise<boolean> {
  const proposals = await obtenerSongProposals();
  const index = proposals.findIndex((item) => item.id === id);
  if (index === -1) return false;

  const proposal = proposals[index];
  if (!proposal) return false;

  proposal.legacyVotesBase = (proposal.legacyVotesBase ?? 0) + 1;
  return guardarSongProposal(proposal);
}

export async function actualizarVisibilidadCancion(id: string, visible: boolean): Promise<boolean> {
  const proposals = await obtenerSongProposals();
  const proposal = proposals.find((item) => item.id === id);
  if (!proposal) return false;

  proposal.visible = visible;
  return guardarSongProposal(proposal);
}

export async function borrarCancion(id: string): Promise<boolean> {
  const [proposals, votes] = await Promise.all([obtenerSongProposals(), obtenerSongVotes()]);
  const nextProposals = proposals.filter((item) => item.id !== id);
  const nextVotes = votes.filter((vote) => vote.proposalId !== id);

  if (!supabaseConfig.enabled) {
    writeProposals(nextProposals);
    writeVotes(nextVotes);
    return true;
  }

  // FUTURO: Supabase/Firebase
  return true;
}
