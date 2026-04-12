export type EventType = "live" | "release";

export interface Database {
  public: {
    Tables: {
      oshi: {
        Row: Oshi;
        Insert: Omit<Oshi, "id" | "created_at">;
        Update: Partial<Omit<Oshi, "id">>;
      };
      events: {
        Row: OshiEvent;
        Insert: Omit<OshiEvent, "id" | "created_at">;
        Update: Partial<Omit<OshiEvent, "id">>;
      };
      user_schedules: {
        Row: UserSchedule;
        Insert: Omit<UserSchedule, "id" | "created_at">;
        Update: Partial<Omit<UserSchedule, "id">>;
      };
    };
  };
}

export interface Oshi {
  id: string;
  user_id: string;
  artist_name: string;
  itunes_id: string | null;
  mb_id: string | null;
  image_url: string | null;
  color: string | null; // ユーザーカラー (hex)
  created_at: string;
}

export interface OshiEvent {
  id: string;
  oshi_id: string;
  type: EventType;
  title: string;
  event_date: string; // YYYY-MM-DD
  url: string | null;
  venue: string | null;
  created_at: string;
}

export interface UserSchedule {
  id: string;
  user_id: string;
  event_id: string;
  memo: string | null;
  reminder_at: string | null;
  created_at: string;
}

// iTunes Search API
export interface ItunesArtist {
  artistId: number;
  artistName: string;
  artistLinkUrl: string;
  primaryGenreName: string;
  artistType: string;
}

export interface ItunesSearchResult {
  resultCount: number;
  results: ItunesArtist[];
}
