import { redirect } from "next/navigation";
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  ProgressRing,
} from "@/components/ui";
import { Navbar } from "@/components/shared/navbar";
import { PageTransition } from "@/components/shared/page-transition";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  let user = null;

  try {
    const supabase = createClient();
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch {
    redirect("/login");
  }

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-background bg-radial-spotlight">
      <Navbar userEmail={user.email} />

      <main className="mx-auto max-w-6xl px-6 py-12">
        <PageTransition>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-h1 text-foreground">Workspace</h1>
              <p className="text-body text-muted-foreground">
                Signed in as {user.email}
              </p>
            </div>
            <Badge variant="success">Authenticated Session</Badge>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <Card variant="glass">
              <CardHeader>
                <CardTitle>Account Status</CardTitle>
                <CardDescription>
                  Protected route verified via Supabase Auth middleware and
                  server session check.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-caption text-muted-foreground">
                <p>User ID: {user.id}</p>
                <p>Email: {user.email}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Foundation Readiness</CardTitle>
                <CardDescription>
                  Phase 1 infrastructure active. Phase 2+ learning modules will
                  mount here.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex items-center gap-6">
                <ProgressRing value={100} size={72} strokeWidth={6} />
                <div className="space-y-1">
                  <p className="text-body font-medium text-foreground">
                    Core Platform Ready
                  </p>
                  <p className="text-caption text-muted-foreground">
                    Auth, Design System, Schema &amp; API initialized
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </PageTransition>
      </main>
    </div>
  );
}
