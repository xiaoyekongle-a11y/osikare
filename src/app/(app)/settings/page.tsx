"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const supabase = createClient();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setEmail(user?.email ?? "");
    });
  }, []);

  async function handleLogout() {
    setLoading(true);
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <div style={{ padding: "20px 16px" }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>設定</h1>

      {/* アカウント */}
      <Section title="アカウント">
        <SettingsRow label="メールアドレス" value={email} />
        <SettingsButton
          label="ログアウト"
          danger
          onClick={handleLogout}
          loading={loading}
        />
      </Section>

      {/* 通知 */}
      <Section title="通知">
        <SettingsRow label="プッシュ通知" value="準備中" />
        <p style={{ fontSize: 13, color: "var(--color-text-3)", marginTop: 4, marginBottom: 0 }}>
          プッシュ通知機能は近日公開予定です
        </p>
      </Section>

      {/* アプリについて */}
      <Section title="アプリについて">
        <SettingsRow label="バージョン" value="0.1.0" />
        <SettingsRow label="お問い合わせ" value="→" />
        <SettingsRow label="プライバシーポリシー" value="→" />
        <SettingsRow label="利用規約" value="→" />
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h2
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: "var(--color-text-3)",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          marginBottom: 8,
        }}
      >
        {title}
      </h2>
      <div
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-md)",
          overflow: "hidden",
        }}
      >
        {children}
      </div>
    </div>
  );
}

function SettingsRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "14px 16px",
        borderBottom: "1px solid var(--color-border)",
      }}
    >
      <span style={{ fontSize: 15 }}>{label}</span>
      <span style={{ fontSize: 14, color: "var(--color-text-3)" }}>{value}</span>
    </div>
  );
}

function SettingsButton({
  label,
  danger,
  onClick,
  loading,
}: {
  label: string;
  danger?: boolean;
  onClick: () => void;
  loading?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      style={{
        width: "100%",
        padding: "14px 16px",
        textAlign: "left",
        background: "none",
        border: "none",
        borderBottom: "1px solid var(--color-border)",
        fontSize: 15,
        color: danger ? "#ef4444" : "var(--color-text)",
        cursor: "pointer",
        fontFamily: "var(--font-sans)",
        opacity: loading ? 0.6 : 1,
      }}
    >
      {loading ? "..." : label}
    </button>
  );
}
