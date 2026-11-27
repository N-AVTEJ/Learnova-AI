import { redirect } from "next/navigation";
import { Navbar } from "@/components/shared/navbar";
import { AssessmentsClient } from "@/components/assessments/assessments-client";
import { createClient } from "@/lib/supabase/server";

export default async function AssessmentsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-background bg-radial-spotlight">
      <Navbar userEmail={user.email} />
      <AssessmentsClient />
    </div>
  );
}
