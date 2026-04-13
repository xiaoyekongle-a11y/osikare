export type EventType = "live" | "release";

export interface Oshi {
  id: string;
  user_id: string;
  artist_name: string;
  itunes_id: string | null;
  mb_id: string | null;
  image_url: string | null;
  color: string | null;
  created_at: string;
}

export interface OshiEvent {
  id: string;
  oshi_id: string;
  type: EventType;
  title: string;
  event_date: string;
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

export type Database = {
  public: {
    Tables: {
      oshi: {
        Row: Oshi;
        Insert: {
          id?: string;
          user_id: string;
          artist_name: string;
          itunes_id?: string | null;
          mb_id?: string | null;
          image_url?: string | null;
          color?: string | null;
          created_at?: string;
        };
        Update: Partial<Oshi>;
      };
      events: {
        Row: OshiEvent;
        Insert: {
          id?: string;
          oshi_id: string;
          type: EventType;
          title: string;
          event_date: string;
          url?: string | null;
          venue?: string | null;
          created_at?: string;
        };
        Update: Partial<OshiEvent>;
      };
      user_schedules: {
        Row: UserSchedule;
        Insert: {
          id?: string;
          user_id: string;
          event_id: string;
          memo?: string | null;
          reminder_at?: string | null;
          created_at?: string;
        };
        Update: Partial<UserSchedule>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};

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
