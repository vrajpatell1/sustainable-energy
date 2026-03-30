import { DashboardShell } from "@/components/dashboard";
import { getDashboardPayload } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const initialData = await getDashboardPayload();

  return <DashboardShell initialData={initialData} />;
}
