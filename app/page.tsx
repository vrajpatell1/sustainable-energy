import { DashboardShell } from "@/components/dashboard";
import { getDashboardPayload } from "@/lib/db";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const initialData = getDashboardPayload();

  return <DashboardShell initialData={initialData} />;
}
