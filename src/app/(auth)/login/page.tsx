"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export const dynamic = "force-dynamic";

function toEmail(username: string) {
  return `${username.toLowerCase().trim()}@osikare.app`;
}

export default function LoginPage() {
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
    if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) { setError("英数字・アンダースコアのみ使えます"); return; }
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
        setError(error.message.includes("already registered")
          ? "このユーザー名はすでに使われています"
          : "登録に失敗しました: " + error.message);
      } else {
        const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
        if (!loginError) router.push("/home");
        else setError("ログインに失敗しました");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError("ユーザー名またはパスワードが違います");
      else router.push("/home");
    }
    setLoading(false);
  }

  return (
    <div style={{
      minHeight: "100dvh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "24px", background: "var(--color-surface-2)",
    }}>
      {/* ロゴ */}
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <div style={{
          width: 64, height: 64, borderRadius: "var(--radius-lg)",
          background: "var(--color-primary-light)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 16px", fontSize: 32,
        }}>🌸</div>
        <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.5px", margin: 0 }}>
          オシカレ
        </h1>
        <p style={{ color: "var(--color-text-2)", fontSize: 14, marginTop: 6 }}>
          推しのスケジュールをまとめて管理
        </p>
      </div>

      {/* フォーム */}
      <div style={{
        width: "100%", maxWidth: 360,
        background: "var(--color-surface)",
        borderRadius: "var(--radius-lg)",
        border: "1px solid var(--color-border)",
        padding: "28px 24px",
      }}>
        <h2 style={{ fontSize: 17, fontWeight: 700, margin: "0 0 20px" }}>
          {isSignUp ? "アカウントを作成" : "ログイン"}
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={labelStyle}>ユーザー名</label>
            <input
              type="text"
              placeholder="例: sakura_fan"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setError(""); }}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              style={inputStyle}
              autoCapitalize="none"
              autoComplete="username"
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

          <button onClick={handleSubmit} disabled={loading} style={{ ...primaryBtnStyle, opacity: loading ? 0.7 : 1 }}>
            {loading ? "..." : isSignUp ? "登録して始める" : "ログイン"}
          </button>

          <button onClick={() => { setIsSignUp(!isSignUp); setError(""); }} style={ghostBtnStyle}>
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
