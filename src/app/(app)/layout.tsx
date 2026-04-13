import BottomNav from "@/components/BottomNav";

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
