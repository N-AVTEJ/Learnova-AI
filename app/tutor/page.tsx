import { redirect } from "next/navigation";
import { Navbar } from "@/components/shared/navbar";
import { TutorClient } from "@/components/tutor/tutor-client";
import { createClient } from "@/lib/supabase/server";

export default async function TutorPage({
  searchParams,
}: {
  searchParams: { topic?: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: concepts } = await supabase
    .from("concepts")
    .select("title")
    .order("order_index", { ascending: true })
    .limit(12);

  const availableTopics = (concepts ?? []).map((c) => c.title);

  return (
    <div className="min-h-screen bg-background bg-radial-spotlight">
      <Navbar userEmail={user.email} />
      <TutorClient
        initialTopic={searchParams.topic || ""}
        availableTopics={availableTopics}
      />
    </div>
  );
}
