"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

// ユーザー名を内部メールに変換
function toEmail(username: string) {
  return `${username.toLowerCase().trim()}@osikare.app`;
}

export default function LoginPrompt({ onClose }: { onClose: () => void }) {
  const supabase = createClient();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    const trimmed = username.trim();
    if (!trimmed) { setError("ユーザー名を入力してください"); return; }
    if (trimmed.length < 3) { setError("ユーザー名は3文字以上にしてください"); return; }
    if (password.length < 6) { setError("パスワードは6文字以上にしてください"); return; }
    if (!/^[a-zA-Z0-9_]+$/.test(password)) { setError("パスワードは英数字・アンダースコアのみ使えます"); return; }

    setLoading(true);
    setError("");
    const email = toEmail(trimmed);

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username: trimmed } },
      });
      if (error) {
        if (error.message.includes("already registered")) {
          setError("このユーザー名はすでに使われています");
        } else {
          setError("登録に失敗しました: " + error.message);
        }
      } else {
        // 登録直後にそのままログイン
        const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
        if (!loginError) { onClose(); router.refresh(); }
        else setError("登録後のログインに失敗しました");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError("ユーザー名またはパスワードが違います");
      } else {
        onClose();
        router.refresh();
      }
    }
    setLoading(false);
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
        display: "flex", alignItems: "flex-end", justifyContent: "center",
        zIndex: 200,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 480,
          background: "var(--color-surface)",
          borderRadius: "var(--radius-lg) var(--radius-lg) 0 0",
          padding: "24px 20px 48px",
        }}
      >
        {/* ハンドル */}
        <div style={{ width: 36, height: 4, background: "var(--color-border)", borderRadius: 2, margin: "0 auto 20px" }} />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>
            {isSignUp ? "アカウントを作成" : "ログイン"}
          </h2>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "var(--color-text-3)", lineHeight: 1 }}>✕</button>
        </div>
        <p style={{ fontSize: 13, color: "var(--color-text-3)", marginBottom: 24 }}>
          {isSignUp ? "推しを保存するにはアカウントが必要です 🌸" : "おかえりなさい 🌸"}
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <label style={labelStyle}>ユーザー名</label>
            <input
              type="text"
              placeholder="例: sakura_fan"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setError(""); }}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              style={inputStyle}
              autoComplete="username"
              autoCapitalize="none"
            />
            {isSignUp && (
              <p style={{ fontSize: 11, color: "var(--color-text-3)", marginTop: 4 }}>
                ユーザー名は何でもOK
              </p>
            )}
          </div>

          <div>
            <label style={labelStyle}>パスワード</label>
            <input
              type="password"
              placeholder="英数字・アンダースコア、6文字以上"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              style={inputStyle}
              autoComplete={isSignUp ? "new-password" : "current-password"}
            />
          </div>

          {error && (
            <div style={{
              background: "#fef2f2", border: "1px solid #fecaca",
              borderRadius: "var(--radius-sm)", padding: "10px 12px",
              fontSize: 13, color: "#dc2626",
            }}>
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              ...primaryBtnStyle,
              opacity: loading ? 0.7 : 1,
              marginTop: 4,
            }}
          >
            {loading ? "..." : isSignUp ? "登録して始める" : "ログイン"}
          </button>

          <button
            onClick={() => { setIsSignUp(!isSignUp); setError(""); }}
            style={ghostBtnStyle}
          >
            {isSignUp ? "すでにアカウントをお持ちの方" : "アカウントを作成する"}
          </button>
        </div>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: 13, fontWeight: 500,
  color: "var(--color-text-2)", marginBottom: 6,
};
const inputStyle: React.CSSProperties = {
  width: "100%", padding: "12px 14px", fontSize: 15,
  border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)",
  outline: "none", fontFamily: "var(--font-sans)",
  background: "var(--color-surface)", color: "var(--color-text)",
};
const primaryBtnStyle: React.CSSProperties = {
  width: "100%", padding: "14px", fontSize: 15, fontWeight: 600,
  background: "var(--color-primary)", color: "#fff", border: "none",
  borderRadius: "var(--radius-sm)", cursor: "pointer", fontFamily: "var(--font-sans)",
};
const ghostBtnStyle: React.CSSProperties = {
  width: "100%", padding: "10px", fontSize: 14,
  color: "var(--color-text-2)", background: "transparent",
  border: "none", cursor: "pointer", fontFamily: "var(--font-sans)",
};
