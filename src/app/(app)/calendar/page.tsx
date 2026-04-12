"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addMonths,
  subMonths,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  parseISO,
} from "date-fns";
import { ja } from "date-fns/locale";
import type { OshiEvent, Oshi } from "@/lib/types";

type EventWithOshi = OshiEvent & { oshi: Pick<Oshi, "artist_name" | "color"> };

export default function CalendarPage() {
  const supabase = createClient();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState<EventWithOshi[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, [currentMonth]);

  async function fetchEvents() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { data: oshiList } = await supabase
      .from("oshi")
      .select("id")
      .eq("user_id", user!.id);

    const oshiIds = oshiList?.map((o) => o.id) ?? [];
    if (oshiIds.length === 0) { setEvents([]); setLoading(false); return; }

    const monthStart = format(startOfMonth(currentMonth), "yyyy-MM-dd");
    const monthEnd = format(endOfMonth(currentMonth), "yyyy-MM-dd");

    const { data } = await supabase
      .from("events")
      .select("*, oshi(artist_name, color)")
      .in("oshi_id", oshiIds)
      .gte("event_date", monthStart)
      .lte("event_date", monthEnd)
      .order("event_date");

    setEvents((data as EventWithOshi[]) ?? []);
    setLoading(false);
  }

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 }),
  });

  const selectedEvents = selectedDate
    ? events.filter((e) => isSameDay(parseISO(e.event_date), selectedDate))
    : [];

  const eventsByDate = events.reduce((acc, e) => {
    const key = e.event_date;
    if (!acc[key]) acc[key] = [];
    acc[key].push(e);
    return acc;
  }, {} as Record<string, EventWithOshi[]>);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100dvh", paddingBottom: 80 }}>
      {/* Header */}
      <div
        style={{
          padding: "16px 16px 12px",
          background: "var(--color-surface)",
          borderBottom: "1px solid var(--color-border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} style={navBtnStyle}>‹</button>
        <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>
          {format(currentMonth, "yyyy年M月", { locale: ja })}
        </h2>
        <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} style={navBtnStyle}>›</button>
      </div>

      {/* Day of week headers */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", background: "var(--color-surface)", padding: "8px 8px 0" }}>
        {["月", "火", "水", "木", "金", "土", "日"].map((d, i) => (
          <div
            key={d}
            style={{
              textAlign: "center",
              fontSize: 12,
              fontWeight: 500,
              padding: "4px 0",
              color: i === 5 ? "#3b82f6" : i === 6 ? "#ef4444" : "var(--color-text-3)",
            }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: 1,
          background: "var(--color-border)",
          flex: "none",
        }}
      >
        {days.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const dayEvents = eventsByDate[key] ?? [];
          const inMonth = isSameMonth(day, currentMonth);
          const selected = selectedDate && isSameDay(day, selectedDate);
          const today = isToday(day);
          const dow = day.getDay(); // 0=Sun, 6=Sat

          return (
            <button
              key={key}
              onClick={() => setSelectedDate(isSameDay(day, selectedDate!) ? null : day)}
              style={{
                background: selected
                  ? "var(--color-primary-light)"
                  : "var(--color-surface)",
                padding: "6px 4px",
                border: "none",
                cursor: "pointer",
                minHeight: 56,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
              }}
            >
              <span
                style={{
                  width: 26,
                  height: 26,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "50%",
                  fontSize: 13,
                  fontWeight: today ? 700 : 400,
                  background: today ? "var(--color-primary)" : "transparent",
                  color: today
                    ? "#fff"
                    : !inMonth
                    ? "var(--color-text-3)"
                    : dow === 0
                    ? "#ef4444"
                    : dow === 6
                    ? "#3b82f6"
                    : "var(--color-text)",
                }}
              >
                {format(day, "d")}
              </span>

              {/* Event dots */}
              <div style={{ display: "flex", gap: 2, flexWrap: "wrap", justifyContent: "center", maxWidth: 32 }}>
                {dayEvents.slice(0, 3).map((e) => (
                  <div
                    key={e.id}
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: "50%",
                      background: e.type === "live" ? "var(--color-live)" : "var(--color-release)",
                      opacity: inMonth ? 1 : 0.4,
                    }}
                  />
                ))}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected day events */}
      <div style={{ flex: 1, overflow: "auto", padding: "16px" }}>
        {selectedDate ? (
          <>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text-2)", marginBottom: 12 }}>
              {format(selectedDate, "M月d日（E）", { locale: ja })}
            </h3>
            {selectedEvents.length === 0 ? (
              <p style={{ color: "var(--color-text-3)", fontSize: 14 }}>この日の予定はありません</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {selectedEvents.map((e) => (
                  <DayEventItem key={e.id} event={e} />
                ))}
              </div>
            )}
          </>
        ) : (
          <div>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text-2)", marginBottom: 12 }}>
              今月のイベント {loading ? "" : `(${events.length}件)`}
            </h3>
            {events.length === 0 && !loading && (
              <p style={{ color: "var(--color-text-3)", fontSize: 14 }}>
                今月の予定はありません
              </p>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {events.map((e) => <DayEventItem key={e.id} event={e} showDate />)}
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div
        style={{
          padding: "10px 16px",
          borderTop: "1px solid var(--color-border)",
          display: "flex",
          gap: 16,
          background: "var(--color-surface)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--color-text-2)" }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--color-live)" }} />
          ライブ
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--color-text-2)" }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--color-release)" }} />
          リリース
        </div>
      </div>
    </div>
  );
}

function DayEventItem({ event, showDate }: { event: EventWithOshi; showDate?: boolean }) {
  const isLive = event.type === "live";
  return (
    <a
      href={event.url ?? "#"}
      target={event.url ? "_blank" : undefined}
      rel="noopener noreferrer"
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderLeft: `3px solid ${isLive ? "var(--color-live)" : "var(--color-release)"}`,
        borderRadius: "var(--radius-sm)",
        padding: "10px 12px",
        display: "flex",
        alignItems: "center",
        gap: 10,
        textDecoration: "none",
        color: "inherit",
      }}
    >
      <span style={{ fontSize: 16 }}>{isLive ? "🎤" : "💿"}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 14, fontWeight: 500, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {event.title}
        </p>
        <p style={{ fontSize: 12, color: "var(--color-text-2)", margin: "2px 0 0" }}>
          <span style={{ color: event.oshi?.color ?? "var(--color-primary)" }}>{event.oshi?.artist_name}</span>
          {showDate && ` · ${format(parseISO(event.event_date), "M/d", { locale: ja })}`}
          {event.venue && ` · ${event.venue}`}
        </p>
      </div>
    </a>
  );
}

const navBtnStyle: React.CSSProperties = {
  background: "none",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--radius-sm)",
  width: 36,
  height: 36,
  fontSize: 20,
  cursor: "pointer",
  color: "var(--color-text-2)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};
