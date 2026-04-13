"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleEmailAuth() {
    setLoading(true);
    setError("");
    setMessage("");
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
      } else {
        setMessage("確認メールを送信しました。メールをご確認ください。");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError("メールアドレスまたはパスワードが正しくありません");
      } else {
        router.push("/home");
      }
    }
    setLoading(false);
  }

  async function handleGoogle() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${location.origin}/auth/callback` },
    });
    if (error) setError(error.message);
    setLoading(false);
  }

  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        background: "var(--color-surface-2)",
      }}
    >
      {/* Logo */}
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "var(--radius-lg)",
            background: "var(--color-primary-light)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
            fontSize: 32,
          }}
        >
          🌸
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.5px", margin: 0 }}>
          オシカレ
        </h1>
        <p style={{ color: "var(--color-text-2)", fontSize: 14, marginTop: 6 }}>
          推しのスケジュールをまとめて管理
        </p>
      </div>

      {/* Form */}
      <div
        style={{
          width: "100%",
          maxWidth: 360,
          background: "var(--color-surface)",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--color-border)",
          padding: "28px 24px",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input
            type="email"
            placeholder="メールアドレス"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
          />
          <input
            type="password"
            placeholder="パスワード"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleEmailAuth()}
            style={inputStyle}
          />

          {error && (
            <p style={{ color: "#ef4444", fontSize: 13, margin: 0 }}>{error}</p>
          )}
          {message && (
            <p style={{ color: "#22c55e", fontSize: 13, margin: 0 }}>{message}</p>
          )}

          <button onClick={handleEmailAuth} disabled={loading} style={primaryBtnStyle}>
            {loading ? "..." : isSignUp ? "新規登録" : "ログイン"}
          </button>

          <button
            onClick={() => { setIsSignUp(!isSignUp); setError(""); setMessage(""); }}
            style={ghostBtnStyle}
          >
            {isSignUp ? "ログインはこちら" : "アカウントを作成"}
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0" }}>
          <div style={{ flex: 1, height: 1, background: "var(--color-border)" }} />
          <span style={{ color: "var(--color-text-3)", fontSize: 12 }}>または</span>
          <div style={{ flex: 1, height: 1, background: "var(--color-border)" }} />
        </div>

        <button onClick={handleGoogle} disabled={loading} style={googleBtnStyle}>
          <GoogleIcon />
          Googleでログイン
        </button>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  fontSize: 15,
  border: "1px solid var(--color-border)",
  borderRadius: "var(--radius-sm)",
  outline: "none",
  fontFamily: "var(--font-sans)",
  background: "var(--color-surface)",
  color: "var(--color-text)",
};

const primaryBtnStyle: React.CSSProperties = {
  width: "100%",
  padding: "13px",
  fontSize: 15,
  fontWeight: 500,
  background: "var(--color-primary)",
  color: "#fff",
  border: "none",
  borderRadius: "var(--radius-sm)",
  cursor: "pointer",
  fontFamily: "var(--font-sans)",
};

const ghostBtnStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px",
  fontSize: 14,
  color: "var(--color-text-2)",
  background: "transparent",
  border: "none",
  cursor: "pointer",
  fontFamily: "var(--font-sans)",
};

const googleBtnStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px",
  fontSize: 14,
  fontWeight: 500,
  background: "var(--color-surface)",
  color: "var(--color-text)",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--radius-sm)",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 10,
  fontFamily: "var(--font-sans)",
};

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
      <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"/>
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z"/>
    </svg>
  );
}

export const dynamic = "force-dynamic";
