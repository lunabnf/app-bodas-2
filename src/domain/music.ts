export interface SongProposal {
  id: string;
  title: string;
  artist: string;
  url?: string;
  proposerGuestToken: string;
  visible: boolean;
  createdAt: number;
  legacyVotesBase?: number;
}

export interface SongVote {
  id: string;
  proposalId: string;
  guestToken: string;
  createdAt: number;
}

export interface MusicSongSummary {
  id: string;
  title: string;
  artist: string;
  url?: string;
  proposerGuestToken: string;
  visible: boolean;
  createdAt: number;
  voteCount: number;
}
