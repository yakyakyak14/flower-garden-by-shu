export interface MusicCategory {
  id: string;
  label: string;
  icon: string;
  presets: MusicPreset[];
}

export interface MusicPreset {
  id: string;
  title: string;
  spotifyType: "playlist" | "track" | "album" | "episode";
  spotifyId: string;
}

// Default: Peaceful Piano playlist
export const DEFAULT_SPOTIFY_TYPE = "playlist";
export const DEFAULT_SPOTIFY_ID = "37i9dQZF1DX4sWSpwq3LiO";

export const MUSIC_CATEGORIES: MusicCategory[] = [
  {
    id: "inspirational-books",
    label: "Books & Talks",
    icon: "📚",
    presets: [
      { id: "book0", title: "The Four Agreements – Summary", spotifyType: "playlist", spotifyId: "5F0PqjgHOzBHFCKPHPj7dW" },
      { id: "book1", title: "Motivational Speeches", spotifyType: "playlist", spotifyId: "37i9dQZF1DWUFmyho2wkQU" },
      { id: "book2", title: "Self-Help Essentials", spotifyType: "playlist", spotifyId: "37i9dQZF1DX1g0iEXLFycr" },
    ],
  },
  {
    id: "background-music",
    label: "Background Music",
    icon: "🎵",
    presets: [
      { id: "calm1", title: "Peaceful Piano", spotifyType: "playlist", spotifyId: "37i9dQZF1DX4sWSpwq3LiO" },
      { id: "calm2", title: "Deep Focus", spotifyType: "playlist", spotifyId: "37i9dQZF1DWZeKCadgRdKQ" },
      { id: "calm3", title: "Lo-fi Beats", spotifyType: "playlist", spotifyId: "37i9dQZF1DWWQRwui0ExPn" },
    ],
  },
  {
    id: "music-with-voice",
    label: "Music with Voice",
    icon: "🎤",
    presets: [
      { id: "voice1", title: "Acoustic Chill", spotifyType: "playlist", spotifyId: "37i9dQZF1DX4E3UdUs7fUx" },
      { id: "voice2", title: "Soft Pop Hits", spotifyType: "playlist", spotifyId: "37i9dQZF1DX1s9knjP51Oa" },
    ],
  },
  {
    id: "nature-sounds",
    label: "Nature & Ambient",
    icon: "🌿",
    presets: [
      { id: "nature1", title: "Nature Sounds", spotifyType: "playlist", spotifyId: "37i9dQZF1DX4PP3DA4J0N8" },
      { id: "nature2", title: "Sleep Sounds", spotifyType: "playlist", spotifyId: "37i9dQZF1DWZd79rJ6a7lp" },
    ],
  },
  {
    id: "mental-health",
    label: "Wellness & Calm",
    icon: "🧠",
    presets: [
      { id: "mh1", title: "Calm Vibes", spotifyType: "playlist", spotifyId: "37i9dQZF1DX3Ogo9pFvBkY" },
      { id: "mh2", title: "Mindful Moments", spotifyType: "playlist", spotifyId: "37i9dQZF1DWZqd5JICZI0u" },
    ],
  },
];

/** Build a Spotify embed URL from type + id */
export function spotifyEmbedUrl(type: string, id: string): string {
  return `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`;
}
