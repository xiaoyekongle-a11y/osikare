import { createClient } from "@/lib/supabase/server";
import { format, isToday, isTomorrow, parseISO, startOfDay, addDays } from "date-fns";
import { ja } from "date-fns/locale";
import type { Oshi, OshiEvent } from "@/lib/types";

export const dynamic = "force-dynamic";

type EventWithOshi = OshiEvent & { oshi: Pick<Oshi, "artist_name" | "color"> | null };

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const today = startOfDay(new Date());
  const weekLater = addDays(today, 7);

  let events: EventWithOshi[] = [];

  if (user) {
    const { data: oshiList } = await (supabase as any)
      .from("oshi")
      .select("id")
      .eq("user_id", user.id);

    const oshiIds: string[] = (oshiList ?? []).map((o: Oshi) => o.id);

    if (oshiIds.length > 0) {
      const { data } = await (supabase as any)
        .from("events")
        .select("*, oshi(artist_name, color)")
        .in("oshi_id", oshiIds)
        .gte("event_date", format(today, "yyyy-MM-dd"))
        .lte("event_date", format(weekLater, "yyyy-MM-dd"))
        .order("event_date", { ascending: true });
      events = data ?? [];
    }
  }

  const todayEvents = events.filter((e) => isToday(parseISO(e.event_date)));
  const upcomingEvents = events.filter((e) => !isToday(parseISO(e.event_date)));

  return (
    <div style={{ padding: "20px 16px" }}>
      <div style={{ marginBottom: 24 }}>
        <p style={{ color: "var(--color-text-3)", fontSize: 13, margin: 0 }}>
          {format(new Date(), "M月d日（E）", { locale: ja })}
        </p>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: "4px 0 0" }}>
          🌸 おはよう
        </h1>
      </div>

      <section style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-2)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          今日
        </h2>
        {todayEvents.length === 0 ? (
          <EmptyCard>
            <span style={{ fontSize: 24 }}>✨</span>
            <p style={{ color: "var(--color-text-3)", fontSize: 14, margin: 0 }}>
              {user ? "今日の予定はありません" : "推しを登録してスケジュールを確認しよう 🌟"}
            </p>
          </EmptyCard>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {todayEvents.map((e) => <EventCard key={e.id} event={e} />)}
          </div>
        )}
      </section>

      <section>
        <h2 style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-2)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          今後7日間
        </h2>
        {upcomingEvents.length === 0 ? (
          <EmptyCard>
            <p style={{ color: "var(--color-text-3)", fontSize: 14, margin: 0 }}>
              {user ? "今後7日間の予定はありません" : "推しタブからアーティストを追加しよう ⭐"}
            </p>
          </EmptyCard>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {upcomingEvents.map((e) => <EventCard key={e.id} event={e} />)}
          </div>
        )}
      </section>
    </div>
  );
}

function EmptyCard({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      background: "var(--color-surface)", border: "1px solid var(--color-border)",
      borderRadius: "var(--radius-md)", padding: "24px",
      display: "flex", flexDirection: "column", alignItems: "center", gap: 8, textAlign: "center",
    }}>
      {children}
    </div>
  );
}

function EventCard({ event }: { event: EventWithOshi }) {
  const date = parseISO(event.event_date);
  const isLive = event.type === "live";
  const accentColor = isLive ? "var(--color-live)" : "var(--color-release)";
  const oshiColor = event.oshi?.color ?? "var(--color-primary)";
  const dateLabel = isToday(date) ? "今日" : isTomorrow(date)
    ? "明日" : format(date, "M/d（E）", { locale: ja });

  return (
    <div style={{
      background: "var(--color-surface)", border: "1px solid var(--color-border)",
      borderRadius: "var(--radius-md)", padding: "14px 16px",
      display: "flex", alignItems: "center", gap: 14,
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: "var(--radius-sm)",
        background: isLive ? "#fff7ed" : "#f5f3ff",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 20, flexShrink: 0,
      }}>
        {isLive ? "🎤" : "💿"}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 15, fontWeight: 500, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {event.title}
        </p>
        <p style={{ fontSize: 13, color: "var(--color-text-2)", margin: "3px 0 0" }}>
          <span style={{ color: oshiColor, fontWeight: 500 }}>{event.oshi?.artist_name}</span>
          {event.venue && ` · ${event.venue}`}
        </p>
      </div>
      <p style={{ fontSize: 13, fontWeight: 500, color: accentColor, margin: 0, flexShrink: 0 }}>
        {dateLabel}
      </p>
    </div>
  );
}
