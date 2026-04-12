"use client";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Oshi, ItunesArtist } from "@/lib/types";
import Image from "next/image";

export default function OshiPage() {
  const supabase = createClient();
  const [oshiList, setOshiList] = useState<Oshi[]>([]);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<ItunesArtist[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    fetchOshi();
  }, []);

  async function fetchOshi() {
    const { data } = await supabase.from("oshi").select("*").order("created_at");
    setOshiList(data ?? []);
  }

  function handleSearch(value: string) {
    setQuery(value);
    clearTimeout(debounceRef.current);
    if (value.trim().length < 2) { setSuggestions([]); return; }
    debounceRef.current = setTimeout(async () => {
      const res = await fetch(
        `https://itunes.apple.com/search?term=${encodeURIComponent(value)}&entity=musicArtist&country=JP&limit=8`
      );
      const json = await res.json();
      setSuggestions(json.results ?? []);
      setShowSuggestions(true);
    }, 400);
  }

  async function addOshi(artist: ItunesArtist) {
    setLoading(true);
    setShowSuggestions(false);
    setQuery("");

    // アーティスト画像をiTunesから取得
    const imgRes = await fetch(
      `https://itunes.apple.com/lookup?id=${artist.artistId}&entity=song&limit=1`
    );
    const imgJson = await imgRes.json();
    const track = imgJson.results?.find((r: any) => r.artworkUrl100);
    const imageUrl = track?.artworkUrl100?.replace("100x100", "300x300") ?? null;

    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("oshi").insert({
      user_id: user!.id,
      artist_name: artist.artistName,
      itunes_id: String(artist.artistId),
      image_url: imageUrl,
      color: randomPastel(),
    });

    await fetchOshi();
    setLoading(false);
  }

  async function removeOshi(id: string) {
    if (!confirm("この推しを削除しますか？\n関連するイベントもすべて削除されます。")) return;
    await supabase.from("oshi").delete().eq("id", id);
    setOshiList((prev) => prev.filter((o) => o.id !== id));
  }

  return (
    <div style={{ padding: "20px 16px" }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>推し管理</h1>

      {/* 検索 */}
      <div style={{ position: "relative", marginBottom: 24 }}>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            type="text"
            placeholder="アーティスト名を検索..."
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            style={{
              flex: 1,
              padding: "12px 14px",
              fontSize: 15,
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-sm)",
              outline: "none",
              fontFamily: "var(--font-sans)",
            }}
          />
        </div>

        {/* サジェスト */}
        {showSuggestions && suggestions.length > 0 && (
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 4px)",
              left: 0,
              right: 0,
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              overflow: "hidden",
              zIndex: 100,
              boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
            }}
          >
            {suggestions.map((artist) => (
              <button
                key={artist.artistId}
                onClick={() => addOshi(artist)}
                disabled={loading || oshiList.some((o) => o.itunes_id === String(artist.artistId))}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  textAlign: "left",
                  background: "none",
                  border: "none",
                  borderBottom: "1px solid var(--color-border)",
                  cursor: "pointer",
                  fontFamily: "var(--font-sans)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <p style={{ fontSize: 15, fontWeight: 500, margin: 0 }}>{artist.artistName}</p>
                  <p style={{ fontSize: 12, color: "var(--color-text-3)", margin: "2px 0 0" }}>
                    {artist.primaryGenreName}
                  </p>
                </div>
                {oshiList.some((o) => o.itunes_id === String(artist.artistId)) ? (
                  <span style={{ fontSize: 12, color: "var(--color-text-3)" }}>登録済み</span>
                ) : (
                  <span style={{ color: "var(--color-primary)", fontSize: 20 }}>+</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 推しリスト */}
      {oshiList.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 0", color: "var(--color-text-3)" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>⭐</div>
          <p style={{ fontSize: 15 }}>推しを追加してみよう</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {oshiList.map((oshi) => (
            <OshiCard key={oshi.id} oshi={oshi} onRemove={removeOshi} />
          ))}
        </div>
      )}
    </div>
  );
}

function OshiCard({ oshi, onRemove }: { oshi: Oshi; onRemove: (id: string) => void }) {
  return (
    <div
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-md)",
        padding: "14px 16px",
        display: "flex",
        alignItems: "center",
        gap: 14,
      }}
    >
      {/* Avatar */}
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: "var(--radius-sm)",
          background: oshi.color ?? "var(--color-primary-light)",
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        {oshi.image_url && (
          <Image
            src={oshi.image_url}
            alt={oshi.artist_name}
            width={48}
            height={48}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        )}
      </div>

      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>{oshi.artist_name}</p>
      </div>

      <button
        onClick={() => onRemove(oshi.id)}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "var(--color-text-3)",
          fontSize: 20,
          padding: "4px 8px",
        }}
      >
        ✕
      </button>
    </div>
  );
}

function randomPastel(): string {
  const colors = ["#f472b6", "#a78bfa", "#34d399", "#60a5fa", "#fb923c", "#facc15"];
  return colors[Math.floor(Math.random() * colors.length)];
}
