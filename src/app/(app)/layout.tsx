import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import BottomNav from "@/components/BottomNav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
      <main style={{ flex: 1, paddingBottom: 80 }}>
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
