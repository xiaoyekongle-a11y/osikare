"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import LoginPrompt from "@/components/LoginPrompt";
import { useRouter } from "next/navigation";

export default function Header({ title }: { title: string }) {
  const supabase = createClient();
  const router = useRouter();
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.refresh();
  }

  return (
    <>
      <div style={{
        padding: "16px 16px 12px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>{title}</h1>

        {user ? (
          <button onClick={handleLogout} style={ghostBtnStyle}>
            ログアウト
          </button>
        ) : (
          <button onClick={() => setShowLogin(true)} style={loginBtnStyle}>
            ログイン
          </button>
        )}
      </div>

      {showLogin && <LoginPrompt onClose={() => { setShowLogin(false); router.refresh(); }} />}
    </>
  );
}

const loginBtnStyle: React.CSSProperties = {
  padding: "7px 16px", fontSize: 13, fontWeight: 500,
  background: "var(--color-primary)", color: "#fff",
  border: "none", borderRadius: "var(--radius-full)",
  cursor: "pointer", fontFamily: "var(--font-sans)",
};

const ghostBtnStyle: React.CSSProperties = {
  padding: "7px 14px", fontSize: 13,
  background: "none", color: "var(--color-text-3)",
  border: "1px solid var(--color-border)", borderRadius: "var(--radius-full)",
  cursor: "pointer", fontFamily: "var(--font-sans)",
};
