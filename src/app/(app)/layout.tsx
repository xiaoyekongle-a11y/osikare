import BottomNav from "@/components/BottomNav";

// 認証チェックを外す。各ページで必要な時だけログイン要求する
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
      <main style={{ flex: 1, paddingBottom: 80 }}>
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
